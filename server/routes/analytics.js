const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');
const auth = require('../middleware/auth');

// GET /api/analytics/dashboard - Get dashboard overview
router.get('/dashboard', auth, async (req, res) => {
  try {
    let surveysQuery, responsesQuery, recentActivityQuery, topSurveysQuery, params;
    
    // If user has 'user' role (guest), show analytics for all surveys
    // If user has 'admin' or 'super_admin' role, show only their own surveys
    if (req.user.role === 'user') {
      surveysQuery = `
        SELECT 
          COUNT(*) as total_surveys,
          COUNT(CASE WHEN status = 'published' THEN 1 END) as published_surveys,
          COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_surveys
         FROM surveys 
         WHERE is_deleted = false
      `;
      
      responsesQuery = `
        SELECT COUNT(DISTINCT r.session_id) as total_respondents
         FROM responses r
         JOIN surveys s ON r.survey_id = s.id
         WHERE s.is_deleted = false
      `;
      
      recentActivityQuery = `
        SELECT 
          s.title as survey_title,
          s.id as survey_id,
          u.name as author_name,
          COUNT(DISTINCT r.session_id) as new_responses,
          MAX(r.created_at) as last_response
         FROM surveys s
         LEFT JOIN users u ON s.user_id = u.id
         LEFT JOIN responses r ON s.id = r.survey_id
         WHERE s.is_deleted = false 
           AND (r.created_at >= NOW() - INTERVAL '7 days' OR r.created_at IS NULL)
         GROUP BY s.id, s.title, u.name
         ORDER BY last_response DESC NULLS LAST
         LIMIT 5
      `;
      
      topSurveysQuery = `
        SELECT 
          s.title,
          s.id,
          u.name as author_name,
          COUNT(DISTINCT r.session_id) as respondent_count,
          COUNT(r.id) as total_responses
         FROM surveys s
         LEFT JOIN users u ON s.user_id = u.id
         LEFT JOIN responses r ON s.id = r.survey_id
         WHERE s.is_deleted = false AND s.status = 'published'
         GROUP BY s.id, s.title, u.name
         ORDER BY respondent_count DESC
         LIMIT 5
      `;
      
      params = [];
    } else {
      surveysQuery = `
        SELECT 
          COUNT(*) as total_surveys,
          COUNT(CASE WHEN status = 'published' THEN 1 END) as published_surveys,
          COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_surveys
         FROM surveys 
         WHERE user_id = $1
      `;
      
      responsesQuery = `
        SELECT COUNT(DISTINCT r.session_id) as total_respondents
         FROM responses r
         JOIN surveys s ON r.survey_id = s.id
         WHERE s.user_id = $1
      `;
      
      recentActivityQuery = `
        SELECT 
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
         LIMIT 5
      `;
      
      topSurveysQuery = `
        SELECT 
          s.title,
          s.id,
          COUNT(DISTINCT r.session_id) as respondent_count,
          COUNT(r.id) as total_responses
         FROM surveys s
         LEFT JOIN responses r ON s.id = r.survey_id
         WHERE s.user_id = $1 AND s.status = 'published'
         GROUP BY s.id, s.title
         ORDER BY respondent_count DESC
         LIMIT 5
      `;
      
      params = [req.user.id];
    }

    // Get user's surveys summary
    const surveysResult = await query(surveysQuery, params);

    // Get total responses across all surveys
    const responsesResult = await query(responsesQuery, params);

    // Get recent activity
    const recentActivityResult = await query(recentActivityQuery, params);

    // Get top performing surveys
    const topSurveysResult = await query(topSurveysQuery, params);

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
    const userId = req.user.id;

    // Verify survey exists and user has access
    let surveyQuery, surveyParams;
    
    if (req.user.role === 'user') {
      // Guest users can view analytics for any survey
      surveyQuery = 'SELECT * FROM surveys WHERE id = $1 AND is_deleted = false';
      surveyParams = [id];
    } else {
      // Admin users can only view their own surveys
      surveyQuery = 'SELECT * FROM surveys WHERE id = $1 AND user_id = $2 AND is_deleted = false';
      surveyParams = [id, userId];
    }

    const surveyResult = await query(surveyQuery, surveyParams);

    if (surveyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const survey = surveyResult.rows[0];

    // Get survey questions
    const questionsResult = await query(
      'SELECT * FROM questions WHERE survey_id = $1 ORDER BY order_index ASC',
      [id]
    );

    // Get response trends over time
    const trendsResult = await query(
      `SELECT 
        DATE(r.created_at) as date,
        COUNT(DISTINCT r.session_id) as daily_respondents,
        COUNT(r.id) as total_responses
       FROM responses r
       WHERE r.survey_id = $1
       GROUP BY DATE(r.created_at)
       ORDER BY date ASC`,
      [id]
    );

    // Get completion statistics
    const completionResult = await query(
      `SELECT 
        COUNT(DISTINCT r.session_id) as total_sessions,
        COUNT(DISTINCT CASE WHEN r.session_id IN (
          SELECT session_id 
          FROM responses 
          WHERE survey_id = $1 
          GROUP BY session_id 
          HAVING COUNT(*) = (SELECT COUNT(*) FROM questions WHERE survey_id = $1)
        ) THEN r.session_id END) as completed_sessions,
        ROUND(
          COUNT(DISTINCT CASE WHEN r.session_id IN (
            SELECT session_id 
            FROM responses 
            WHERE survey_id = $1 
            GROUP BY session_id 
            HAVING COUNT(*) = (SELECT COUNT(*) FROM questions WHERE survey_id = $1)
          ) THEN r.session_id END) * 100.0 / NULLIF(COUNT(DISTINCT r.session_id), 0), 2
        ) as completion_rate
       FROM responses r
       WHERE r.survey_id = $1`,
      [id]
    );

    // Get device and browser analytics
    const deviceAnalyticsResult = await query(
      `SELECT 
        CASE 
          WHEN r.metadata->>'userAgent' LIKE '%Mobile%' THEN 'Mobile'
          WHEN r.metadata->>'userAgent' LIKE '%Tablet%' THEN 'Tablet'
          WHEN r.metadata->>'userAgent' IS NOT NULL THEN 'Desktop'
          ELSE 'Unknown'
        END as device_type,
        COUNT(DISTINCT r.session_id) as respondent_count
       FROM responses r
       WHERE r.survey_id = $1
       GROUP BY device_type
       ORDER BY respondent_count DESC`,
      [id]
    );

    // Get browser analytics
    const browserAnalyticsResult = await query(
      `SELECT 
        CASE 
          WHEN r.metadata->>'userAgent' LIKE '%Chrome%' THEN 'Chrome'
          WHEN r.metadata->>'userAgent' LIKE '%Firefox%' THEN 'Firefox'
          WHEN r.metadata->>'userAgent' LIKE '%Safari%' THEN 'Safari'
          WHEN r.metadata->>'userAgent' LIKE '%Edge%' THEN 'Edge'
          WHEN r.metadata->>'userAgent' IS NOT NULL THEN 'Other'
          ELSE 'Unknown'
        END as browser,
        COUNT(DISTINCT r.session_id) as respondent_count
       FROM responses r
       WHERE r.survey_id = $1
       GROUP BY browser
       ORDER BY respondent_count DESC`,
      [id]
    );

    // Get hourly distribution
    const hourlyDistributionResult = await query(
      `SELECT 
        EXTRACT(HOUR FROM r.created_at) as hour,
        COUNT(DISTINCT r.session_id) as respondent_count
       FROM responses r
       WHERE r.survey_id = $1
       GROUP BY hour
       ORDER BY hour`,
      [id]
    );

    // Get question completion rates
    const questionCompletionResult = await query(
      `SELECT 
        q.id,
        q.title,
        q.type,
        COUNT(DISTINCT r.session_id) as respondent_count,
        ROUND(
          COUNT(DISTINCT r.session_id) * 100.0 / NULLIF((
            SELECT COUNT(DISTINCT r2.session_id) 
            FROM responses r2 
            WHERE r2.survey_id = $1
          ), 0), 2
        ) as completion_rate
       FROM questions q
       LEFT JOIN responses r ON q.id = r.question_id
       WHERE q.survey_id = $1
       GROUP BY q.id, q.title, q.type
       ORDER BY q.order_index ASC`,
      [id]
    );

    // Get response time analysis (time between questions)
    const responseTimeResult = await query(
      `WITH response_times AS (
         SELECT 
           r1.session_id,
           r1.question_id,
           r1.created_at,
           r2.created_at as next_response_time,
           EXTRACT(EPOCH FROM (r2.created_at - r1.created_at)) as time_diff_seconds
         FROM responses r1
         LEFT JOIN responses r2 ON r1.session_id = r2.session_id 
           AND r2.created_at > r1.created_at
           AND r2.created_at = (
             SELECT MIN(r3.created_at) 
             FROM responses r3 
             WHERE r3.session_id = r1.session_id 
               AND r3.created_at > r1.created_at
           )
         WHERE r1.survey_id = $1
       )
       SELECT 
         COALESCE(AVG(time_diff_seconds), 0) as avg_time_between_questions,
         COALESCE(MIN(time_diff_seconds), 0) as min_time_between_questions,
         COALESCE(MAX(time_diff_seconds), 0) as max_time_between_questions,
         COUNT(*) as total_transitions
       FROM response_times 
       WHERE time_diff_seconds IS NOT NULL`,
      [id]
    );

    // Get weekly response patterns
    const weeklyPatternResult = await query(
      `SELECT 
        EXTRACT(DOW FROM r.created_at) as day_of_week,
        TO_CHAR(r.created_at, 'Day') as day_name,
        COUNT(DISTINCT r.session_id) as respondent_count
       FROM responses r
       WHERE r.survey_id = $1
       GROUP BY day_of_week, day_name
       ORDER BY day_of_week`,
      [id]
    );

    // Get question difficulty analysis (based on completion rates)
    const questionDifficultyResult = await query(
      `SELECT 
        q.id,
        q.title,
        q.type,
        COUNT(DISTINCT r.session_id) as respondent_count,
        ROUND(
          COUNT(DISTINCT r.session_id) * 100.0 / NULLIF((
            SELECT COUNT(DISTINCT r2.session_id) 
            FROM responses r2 
            WHERE r2.survey_id = $1
          ), 0), 2
        ) as completion_rate,
        CASE 
          WHEN COUNT(DISTINCT r.session_id) * 100.0 / NULLIF((
            SELECT COUNT(DISTINCT r2.session_id) 
            FROM responses r2 
            WHERE r2.survey_id = $1
          ), 0) >= 80 THEN 'Easy'
          WHEN COUNT(DISTINCT r.session_id) * 100.0 / NULLIF((
            SELECT COUNT(DISTINCT r2.session_id) 
            FROM responses r2 
            WHERE r2.survey_id = $1
          ), 0) >= 60 THEN 'Medium'
          ELSE 'Hard'
        END as difficulty_level
       FROM questions q
       LEFT JOIN responses r ON q.id = r.question_id
       WHERE q.survey_id = $1
       GROUP BY q.id, q.title, q.type
       ORDER BY completion_rate ASC`,
      [id]
    );

    // Get engagement score (based on completion rate and response time)
    const engagementScoreResult = await query(
      `WITH completion_metrics AS (
         SELECT 
           COALESCE(
             (SELECT ROUND(
               COUNT(DISTINCT r2.session_id) * 100.0 / NULLIF(COUNT(DISTINCT r3.session_id), 0), 2
             )
             FROM responses r2
             LEFT JOIN responses r3 ON r2.survey_id = r3.survey_id
             WHERE r2.survey_id = $1 AND r3.survey_id = $1), 0
           ) as completion_rate
       ),
       time_metrics AS (
         SELECT 
           COALESCE(
             (SELECT AVG(time_diff_seconds)
              FROM (
                SELECT 
                  r1.session_id,
                  r1.question_id,
                  r1.created_at,
                  r2.created_at as next_response_time,
                  EXTRACT(EPOCH FROM (r2.created_at - r1.created_at)) as time_diff_seconds
                FROM responses r1
                LEFT JOIN responses r2 ON r1.session_id = r2.session_id 
                  AND r2.created_at > r1.created_at
                  AND r2.created_at = (
                    SELECT MIN(r3.created_at) 
                    FROM responses r3 
                    WHERE r3.session_id = r1.session_id 
                      AND r3.created_at > r1.created_at
                  )
                WHERE r1.survey_id = $1
              ) response_times 
              WHERE time_diff_seconds IS NOT NULL), 0
           ) as avg_time_between_questions
       )
       SELECT 
         ROUND(
           (cm.completion_rate * 0.7) + 
           (CASE 
             WHEN tm.avg_time_between_questions < 30 THEN 30
             WHEN tm.avg_time_between_questions < 60 THEN 20
             WHEN tm.avg_time_between_questions < 120 THEN 10
             ELSE 0
           END), 2
         ) as engagement_score
       FROM completion_metrics cm, time_metrics tm`,
      [id]
    );

    // Get location analytics
    const locationAnalyticsResult = await query(
      `SELECT 
        r.metadata->>'location' as location_data,
        COUNT(DISTINCT r.session_id) as respondent_count
       FROM responses r
       WHERE r.survey_id = $1 
         AND r.metadata IS NOT NULL 
         AND r.metadata->>'location' IS NOT NULL
         AND r.metadata->>'location' != 'null'
       GROUP BY r.metadata->>'location'
       ORDER BY respondent_count DESC
       LIMIT 10`,
      [id]
    );

    // Process location data
    const processedLocationData = locationAnalyticsResult.rows.map(row => {
      try {
        const locationData = JSON.parse(row.location_data);
        return {
          country: locationData.country || 'Unknown',
          region: locationData.region || 'Unknown',
          city: locationData.city || 'Unknown',
          respondent_count: row.respondent_count
        };
      } catch (error) {
        return {
          country: 'Unknown',
          region: 'Unknown',
          city: 'Unknown',
          respondent_count: row.respondent_count
        };
      }
    });

    res.json({
      survey: survey,
      questions: questionsResult.rows,
      trends: trendsResult.rows,
      completion: completionResult.rows[0] || { total_sessions: 0, completed_sessions: 0, completion_rate: 0 },
      deviceAnalytics: deviceAnalyticsResult.rows,
      browserAnalytics: browserAnalyticsResult.rows,
      hourlyDistribution: hourlyDistributionResult.rows,
      questionCompletion: questionCompletionResult.rows,
      locationAnalytics: processedLocationData,
      responseTimeAnalysis: responseTimeResult.rows[0] || { avg_time_between_questions: 0, min_time_between_questions: 0, max_time_between_questions: 0, total_transitions: 0 },
      weeklyPatterns: weeklyPatternResult.rows,
      questionDifficulty: questionDifficultyResult.rows,
      engagementScore: engagementScoreResult.rows[0] || { engagement_score: 0 }
    });

  } catch (error) {
    console.error('Error fetching survey analytics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/analytics/question/:id - Get analytics for a specific question
router.get('/question/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify question exists and user has access
    let questionQuery, questionParams;
    
    if (req.user.role === 'user') {
      // Guest users can view analytics for any question
      questionQuery = `
        SELECT q.*, s.title as survey_title, u.name as author_name
         FROM questions q
         JOIN surveys s ON q.survey_id = s.id
         LEFT JOIN users u ON s.user_id = u.id
         WHERE q.id = $1 AND s.is_deleted = false
      `;
      questionParams = [id];
    } else {
      // Admin users can only view questions from their own surveys
      questionQuery = `
        SELECT q.*, s.title as survey_title
         FROM questions q
         JOIN surveys s ON q.survey_id = s.id
         WHERE q.id = $1 AND s.user_id = $2 AND s.is_deleted = false
      `;
      questionParams = [id, req.user.id];
    }

    const questionCheck = await query(questionQuery, questionParams);

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