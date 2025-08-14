const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

// Helper function to get location from IP (simplified version)
const getLocationFromIP = async (ip) => {
  try {
    // Skip localhost and private IPs
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return {
        country: 'Local',
        region: 'Development',
        city: 'Localhost',
        timezone: 'UTC'
      };
    }

    // For production, you would use a service like ipapi.co, ipinfo.io, or MaxMind
    // This is a simplified version that returns basic info
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=country,regionName,city,timezone`, {
      timeout: 5000 // 5 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return {
      country: data.country || 'Unknown',
      region: data.regionName || 'Unknown',
      city: data.city || 'Unknown',
      timezone: data.timezone || 'Unknown'
    };
  } catch (error) {
    console.log('Error getting location from IP:', error.message);
    return {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      timezone: 'Unknown'
    };
  }
};

// POST /api/responses - Submit survey responses
router.post('/', async (req, res) => {
  try {
    const { surveyId, responses, sessionId } = req.body;

    console.log('Received response submission:', { surveyId, responsesCount: responses?.length, sessionId });

    // Validate input
    if (!surveyId || !responses || !Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Validate survey exists and is published
    const surveyResult = await query(
      'SELECT id FROM surveys WHERE id = $1 AND status = $2',
      [surveyId, 'published']
    );

    if (surveyResult.rows.length === 0) {
      console.log('Survey not found or not published:', surveyId);
      return res.status(404).json({ error: 'Survey not found or not published' });
    }

    // Generate session ID if not provided
    const respondentSessionId = sessionId || uuidv4();

    console.log('Processing responses for survey:', surveyId, 'session:', respondentSessionId);

    // Start a transaction
    await query('BEGIN');

    try {
      // Insert each response
      for (const response of responses) {
        const { questionId, answer } = response;

        console.log('Processing response:', { questionId, answer });

        // Validate question exists and belongs to survey
        const questionResult = await query(
          'SELECT id FROM questions WHERE id = $1 AND survey_id = $2',
          [questionId, surveyId]
        );

        if (questionResult.rows.length === 0) {
          throw new Error(`Question ${questionId} not found in survey ${surveyId}`);
        }

        // Get location data from IP
        const ipAddress = req.ip || req.connection.remoteAddress || '';
        const locationData = await getLocationFromIP(ipAddress);

        // Insert response with additional metadata
        const insertResult = await query(
          `INSERT INTO responses (survey_id, question_id, answer, session_id, metadata)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [
            surveyId, 
            questionId, 
            JSON.stringify(answer), 
            respondentSessionId,
            JSON.stringify({
              userAgent: req.headers['user-agent'] || '',
              ipAddress: ipAddress,
              timestamp: new Date().toISOString(),
              referrer: req.headers.referer || '',
              language: req.headers['accept-language'] || '',
              timezone: req.headers['timezone'] || '',
              location: locationData
            })
          ]
        );

        console.log('Inserted response with ID:', insertResult.rows[0].id);
      }

      await query('COMMIT');

      console.log('Successfully submitted all responses for session:', respondentSessionId);

      res.status(201).json({ 
        message: 'Responses submitted successfully',
        sessionId: respondentSessionId,
        surveyId: surveyId
      });

    } catch (error) {
      await query('ROLLBACK');
      console.error('Transaction error:', error);
      throw error;
    }

  } catch (error) {
    console.error('Error submitting responses:', error);
    res.status(500).json({ error: 'Failed to submit responses' });
  }
});

// GET /api/responses/survey/:id - Get responses for a survey (with analytics)
router.get('/survey/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get survey details
    const surveyResult = await query(
      'SELECT * FROM surveys WHERE id = $1',
      [id]
    );

    if (surveyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Get questions with response analytics
    const questionsResult = await query(
      `SELECT q.*, 
              COUNT(r.id) as response_count,
              COUNT(DISTINCT r.session_id) as unique_respondents
       FROM questions q
       LEFT JOIN responses r ON q.id = r.question_id
       WHERE q.survey_id = $1
       GROUP BY q.id
       ORDER BY q.order_index ASC`,
      [id]
    );

    // Get detailed responses for each question
    const questionsWithResponses = await Promise.all(
      questionsResult.rows.map(async (question) => {
        const responsesResult = await query(
          'SELECT answer, session_id, created_at FROM responses WHERE question_id = $1 ORDER BY created_at DESC',
          [question.id]
        );

        // Process responses based on question type
        let analytics = {};
        
        if (question.type === 'emoji_scale' || question.type === 'likert_scale') {
          analytics = processScaleResponses(responsesResult.rows, question.options);
        } else if (question.type === 'multiple_choice') {
          analytics = processMultipleChoiceResponses(responsesResult.rows, question.options);
        } else if (question.type === 'text') {
          analytics = processTextResponses(responsesResult.rows);
        }

        return {
          ...question,
          responses: responsesResult.rows,
          analytics
        };
      })
    );

    res.json({
      survey: surveyResult.rows[0],
      questions: questionsWithResponses
    });

  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

// Helper function to process scale responses (emoji, likert)
function processScaleResponses(responses, options) {
  const distribution = {};
  let total = 0;
  let sum = 0;

  // Initialize distribution
  if (options && Array.isArray(options)) {
    options.forEach(option => {
      distribution[option.value] = {
        count: 0,
        percentage: 0,
        label: option.label,
        emoji: option.emoji
      };
    });
  }

  // Count responses
  responses.forEach(response => {
    const answer = response.answer;
    if (typeof answer === 'number' || typeof answer === 'string') {
      const value = typeof answer === 'string' ? parseInt(answer) : answer;
      if (distribution[value]) {
        distribution[value].count++;
        total++;
        sum += value;
      }
    }
  });

  // Calculate percentages and average
  Object.keys(distribution).forEach(key => {
    distribution[key].percentage = total > 0 ? (distribution[key].count / total) * 100 : 0;
  });

  return {
    distribution,
    total,
    average: total > 0 ? (sum / total).toFixed(2) : 0,
    satisfactionIndex: calculateSatisfactionIndex(distribution, options)
  };
}

// Helper function to process multiple choice responses
function processMultipleChoiceResponses(responses, options) {
  const distribution = {};
  let total = 0;

  // Initialize distribution
  if (options && Array.isArray(options)) {
    options.forEach(option => {
      const key = typeof option === 'string' ? option : option.label;
      distribution[key] = { count: 0, percentage: 0 };
    });
  }

  // Count responses
  responses.forEach(response => {
    const answer = response.answer;
    if (typeof answer === 'string') {
      if (distribution[answer]) {
        distribution[answer].count++;
        total++;
      }
    }
  });

  // Calculate percentages
  Object.keys(distribution).forEach(key => {
    distribution[key].percentage = total > 0 ? (distribution[key].count / total) * 100 : 0;
  });

  return {
    distribution,
    total
  };
}

// Helper function to process text responses
function processTextResponses(responses) {
  return {
    total: responses.length,
    responses: responses.map(r => ({
      text: r.answer,
      timestamp: r.created_at
    }))
  };
}

// Helper function to calculate satisfaction index
function calculateSatisfactionIndex(distribution, options) {
  if (!options || !Array.isArray(options)) return 0;

  let weightedSum = 0;
  let total = 0;

  Object.keys(distribution).forEach(key => {
    const count = distribution[key].count;
    weightedSum += parseInt(key) * count;
    total += count;
  });

  if (total === 0) return 0;

  const average = weightedSum / total;
  const maxValue = Math.max(...options.map(opt => opt.value));
  
  // Convert to percentage (0-100)
  return Math.round((average / maxValue) * 100);
}

// GET /api/responses/export/:id - Export responses as CSV
router.get('/export/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'csv' } = req.query;

    // Get survey and questions
    const surveyResult = await query(
      'SELECT * FROM surveys WHERE id = $1',
      [id]
    );

    if (surveyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const questionsResult = await query(
      'SELECT * FROM questions WHERE survey_id = $1 ORDER BY order_index ASC',
      [id]
    );

    // Get all responses grouped by session
    const sessionsResult = await query(
      `SELECT DISTINCT session_id FROM responses WHERE survey_id = $1`,
      [id]
    );

    if (format === 'csv') {
      // Generate CSV
      let csv = 'Session ID,';
      questionsResult.rows.forEach((question, index) => {
        csv += `"${question.title}"`;
        if (index < questionsResult.rows.length - 1) csv += ',';
      });
      csv += '\n';

      // Add response data
      for (const session of sessionsResult.rows) {
        csv += `${session.session_id},`;
        
        for (let i = 0; i < questionsResult.rows.length; i++) {
          const question = questionsResult.rows[i];
          const responseResult = await query(
            'SELECT answer FROM responses WHERE session_id = $1 AND question_id = $2',
            [session.session_id, question.id]
          );

          const answer = responseResult.rows.length > 0 ? responseResult.rows[0].answer : '';
          csv += `"${typeof answer === 'object' ? JSON.stringify(answer) : answer}"`;
          
          if (i < questionsResult.rows.length - 1) csv += ',';
        }
        csv += '\n';
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="survey_${id}_responses.csv"`);
      res.send(csv);
    } else {
      res.status(400).json({ error: 'Unsupported export format' });
    }

  } catch (error) {
    console.error('Error exporting responses:', error);
    res.status(500).json({ error: 'Failed to export responses' });
  }
});

module.exports = router; 