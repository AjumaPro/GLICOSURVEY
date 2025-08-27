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
         WHERE is_deleted = 0
      `;
      
      responsesQuery = `
        SELECT COUNT(DISTINCT r.session_id) as total_respondents
         FROM responses r
         JOIN surveys s ON r.survey_id = s.id
         WHERE s.is_deleted = 0
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
         WHERE s.is_deleted = 0 
           AND (r.created_at >= datetime('now', '-7 days') OR r.created_at IS NULL)
         GROUP BY s.id, s.title, u.name
         ORDER BY last_response DESC
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
         WHERE s.is_deleted = 0 AND s.status = 'published'
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
         WHERE user_id = ?
      `;
      
      responsesQuery = `
        SELECT COUNT(DISTINCT r.session_id) as total_respondents
         FROM responses r
         JOIN surveys s ON r.survey_id = s.id
         WHERE s.user_id = ?
      `;
      
      recentActivityQuery = `
        SELECT 
          s.title as survey_title,
          s.id as survey_id,
          COUNT(DISTINCT r.session_id) as new_responses,
          MAX(r.created_at) as last_response
         FROM surveys s
         LEFT JOIN responses r ON s.id = r.survey_id
         WHERE s.user_id = ? 
           AND (r.created_at >= datetime('now', '-7 days') OR r.created_at IS NULL)
         GROUP BY s.id, s.title
         ORDER BY last_response DESC
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
         WHERE s.user_id = ? AND s.status = 'published'
         GROUP BY s.id, s.title
         ORDER BY respondent_count DESC
         LIMIT 5
      `;
      
      params = [req.user.id];
    }

    const [surveysResult, responsesResult, recentActivityResult, topSurveysResult] = await Promise.all([
      query(surveysQuery, params),
      query(responsesQuery, params),
      query(recentActivityQuery, params),
      query(topSurveysQuery, params)
    ]);

    const dashboardData = {
      surveys: surveysResult.rows[0],
      responses: responsesResult.rows[0],
      recentActivity: recentActivityResult.rows,
      topSurveys: topSurveysResult.rows
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching analytics dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch analytics dashboard' });
  }
});

// GET /api/analytics/survey/:id - Get analytics for a specific survey
router.get('/survey/:id', auth, async (req, res) => {
  try {
    const surveyId = req.params.id;
    
    // Check if user has access to this survey
    const surveyCheck = await query(
      'SELECT id, title, user_id FROM surveys WHERE id = ? AND is_deleted = 0',
      [surveyId]
    );

    if (surveyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const survey = surveyCheck.rows[0];
    
    // If user is not admin/super_admin, they can only see their own surveys
    if (req.user.role !== 'user' && survey.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get survey analytics
    const analyticsQuery = `
      SELECT 
        COUNT(DISTINCT r.session_id) as total_respondents,
        COUNT(r.id) as total_responses,
        MIN(r.created_at) as first_response,
        MAX(r.created_at) as last_response
      FROM responses r
      WHERE r.survey_id = ?
    `;

    const analyticsResult = await query(analyticsQuery, [surveyId]);
    
    // Get question-wise analytics
    const questionAnalyticsQuery = `
      SELECT 
        q.id,
        q.question_text,
        q.question_type,
        COUNT(r.id) as response_count,
        GROUP_CONCAT(r.answer) as answers
      FROM questions q
      LEFT JOIN responses r ON q.id = r.question_id
      WHERE q.survey_id = ? AND q.is_deleted = 0
      GROUP BY q.id, q.question_text, q.question_type
      ORDER BY q.order_index
    `;

    const questionAnalyticsResult = await query(questionAnalyticsQuery, [surveyId]);

    const analytics = {
      survey: {
        id: survey.id,
        title: survey.title
      },
      overview: analyticsResult.rows[0],
      questions: questionAnalyticsResult.rows.map(q => ({
        ...q,
        answers: q.answers ? q.answers.split(',') : []
      }))
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching survey analytics:', error);
    res.status(500).json({ error: 'Failed to fetch survey analytics' });
  }
});

module.exports = router; 