const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');
const auth = require('../middleware/auth');

// GET /api/analytics/dashboard - Get dashboard overview
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Get user's surveys summary
    const surveysResult = await query(
      `SELECT 
        COUNT(*) as total_surveys,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_surveys,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_surveys
       FROM surveys 
       WHERE user_id = $1`,
      [req.user.id]
    );

    // Get total responses across all surveys
    const responsesResult = await query(
      `SELECT COUNT(DISTINCT r.session_id) as total_respondents
       FROM responses r
       JOIN surveys s ON r.survey_id = s.id
       WHERE s.user_id = $1`,
      [req.user.id]
    );

    // Get recent activity
    const recentActivityResult = await query(
      `SELECT 
        s.title as survey_title,
        s.id as survey_id,
        COUNT(DISTINCT r.session_id) as new_responses,
        MAX(r.created_at) as last_response
       FROM surveys s
       LEFT JOIN responses r ON s.id = r.survey_id
       WHERE s.user_id = $1 
         AND (r.created_at >= NOW() - INTERVAL '7 days' OR r.created_at IS NULL)
       GROUP BY s.id, s.title
       ORDER BY last_response DESC NULLS LAST
       LIMIT 5`,
      [req.user.id]
    );

    // Get top performing surveys
    const topSurveysResult = await query(
      `SELECT 
        s.title,
        s.id,
        COUNT(DISTINCT r.session_id) as respondent_count,
        COUNT(r.id) as total_responses
       FROM surveys s
       LEFT JOIN responses r ON s.id = r.survey_id
       WHERE s.user_id = $1 AND s.status = 'published'
       GROUP BY s.id, s.title
       ORDER BY respondent_count DESC
       LIMIT 5`,
      [req.user.id]
    );

    res.json({
      summary: {
        ...surveysResult.rows[0],
        total_respondents: responsesResult.rows[0]?.total_respondents || 0
      },
      recent_activity: recentActivityResult.rows,
      top_surveys: topSurveysResult.rows
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// GET /api/analytics/survey/:id - Get detailed analytics for a survey
router.get('/survey/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify survey belongs to user
    const surveyCheck = await query(
      'SELECT id FROM surveys WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (surveyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Get survey details
    const surveyResult = await query(
      'SELECT * FROM surveys WHERE id = $1',
      [id]
    );

    // Get questions with response counts
    const questionsResult = await query(
      `SELECT q.*, COUNT(DISTINCT r.session_id) as respondent_count
       FROM questions q
       LEFT JOIN responses r ON q.id = r.question_id
       WHERE q.survey_id = $1
       GROUP BY q.id
       ORDER BY q.order_index ASC`,
      [id]
    );

    // Get response trends over time
    const trendsResult = await query(
      `SELECT 
        DATE(r.created_at) as date,
        COUNT(DISTINCT r.session_id) as daily_respondents
       FROM responses r
       WHERE r.survey_id = $1
       GROUP BY DATE(r.created_at)
       ORDER BY date DESC
       LIMIT 30`,
      [id]
    );

    // Get completion rate
    const completionResult = await query(
      `WITH question_counts AS (
         SELECT COUNT(*) as total_questions
         FROM questions 
         WHERE survey_id = $1
       ),
       response_counts AS (
         SELECT session_id, COUNT(*) as answered_questions
         FROM responses 
         WHERE survey_id = $1
         GROUP BY session_id
       )
       SELECT 
         COALESCE(COUNT(*), 0) as total_sessions,
         COALESCE(COUNT(CASE WHEN rc.answered_questions = qc.total_questions THEN 1 END), 0) as completed_sessions,
         CASE 
           WHEN COUNT(*) = 0 THEN 0
           ELSE ROUND(
             COUNT(CASE WHEN rc.answered_questions = qc.total_questions THEN 1 END) * 100.0 / COUNT(*), 2
           )
         END as completion_rate
       FROM response_counts rc
       CROSS JOIN question_counts qc`,
      [id]
    );

    res.json({
      survey: surveyResult.rows[0],
      questions: questionsResult.rows,
      trends: trendsResult.rows,
      completion: completionResult.rows[0] || { total_sessions: 0, completed_sessions: 0, completion_rate: 0 }
    });

  } catch (error) {
    console.error('Error fetching survey analytics:', error);
    res.status(500).json({ error: 'Failed to fetch survey analytics' });
  }
});

// GET /api/analytics/question/:id - Get analytics for a specific question
router.get('/question/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify question belongs to user's survey
    const questionCheck = await query(
      `SELECT q.*, s.title as survey_title
       FROM questions q
       JOIN surveys s ON q.survey_id = s.id
       WHERE q.id = $1 AND s.user_id = $2`,
      [id, req.user.id]
    );

    if (questionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const question = questionCheck.rows[0];

    // Get responses for this question
    const responsesResult = await query(
      'SELECT answer, session_id, created_at FROM responses WHERE question_id = $1 ORDER BY created_at DESC',
      [id]
    );

    // Process analytics based on question type
    let analytics = {};

    if (question.type === 'emoji_scale' || question.type === 'likert_scale') {
      analytics = processScaleAnalytics(responsesResult.rows, question.options);
    } else if (question.type === 'multiple_choice') {
      analytics = processMultipleChoiceAnalytics(responsesResult.rows, question.options);
    } else if (question.type === 'text') {
      analytics = processTextAnalytics(responsesResult.rows);
    }

    res.json({
      question,
      analytics,
      total_responses: responsesResult.rows.length
    });

  } catch (error) {
    console.error('Error fetching question analytics:', error);
    res.status(500).json({ error: 'Failed to fetch question analytics' });
  }
});

// Helper function to process scale analytics
function processScaleAnalytics(responses, options) {
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

  // Calculate percentages
  Object.keys(distribution).forEach(key => {
    distribution[key].percentage = total > 0 ? (distribution[key].count / total) * 100 : 0;
  });

  return {
    distribution,
    total,
    average: total > 0 ? (sum / total).toFixed(2) : 0,
    satisfaction_index: calculateSatisfactionIndex(distribution, options)
  };
}

// Helper function to process multiple choice analytics
function processMultipleChoiceAnalytics(responses, options) {
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

// Helper function to process text analytics
function processTextAnalytics(responses) {
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
  
  return Math.round((average / maxValue) * 100);
}

module.exports = router; 