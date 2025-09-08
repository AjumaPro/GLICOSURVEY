const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');
const auth = require('../middleware/auth');

// GET /api/wordpress/surveys - Export surveys for WordPress
router.get('/surveys', auth, async (req, res) => {
  try {
    // Get all surveys with questions
    const surveys = await query(`
      SELECT s.*, 
             GROUP_CONCAT(
               json_object(
                 'id', q.id,
                 'question_text', q.question_text,
                 'question_type', q.question_type,
                 'options', q.options,
                 'required', q.required,
                 'order_index', q.order_index
               )
             ) as questions_json
      FROM surveys s
      LEFT JOIN questions q ON s.id = q.survey_id AND q.is_deleted = 0
      WHERE s.is_deleted = 0
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);

    // Format data for WordPress
    const formattedSurveys = surveys.rows.map(survey => ({
      id: survey.id,
      title: survey.title,
      description: survey.description,
      status: survey.status,
      settings: JSON.parse(survey.settings || '{}'),
      questions: survey.questions_json ? 
        survey.questions_json.split(',').map(q => JSON.parse(q)) : [],
      created_at: survey.created_at,
      updated_at: survey.updated_at
    }));

    res.json({
      success: true,
      data: formattedSurveys,
      count: formattedSurveys.length
    });
  } catch (error) {
    console.error('Error exporting surveys for WordPress:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to export surveys' 
    });
  }
});

// GET /api/wordpress/surveys/:id - Export specific survey
router.get('/surveys/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const survey = await query(`
      SELECT s.*, 
             GROUP_CONCAT(
               json_object(
                 'id', q.id,
                 'question_text', q.question_text,
                 'question_type', q.question_type,
                 'options', q.options,
                 'required', q.required,
                 'order_index', q.order_index
               )
             ) as questions_json
      FROM surveys s
      LEFT JOIN questions q ON s.id = q.survey_id AND q.is_deleted = 0
      WHERE s.id = ? AND s.is_deleted = 0
      GROUP BY s.id
    `, [id]);

    if (survey.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Survey not found' 
      });
    }

    const surveyData = survey.rows[0];
    const formattedSurvey = {
      id: surveyData.id,
      title: surveyData.title,
      description: surveyData.description,
      status: surveyData.status,
      settings: JSON.parse(surveyData.settings || '{}'),
      questions: surveyData.questions_json ? 
        surveyData.questions_json.split(',').map(q => JSON.parse(q)) : [],
      created_at: surveyData.created_at,
      updated_at: surveyData.updated_at
    };

    res.json({
      success: true,
      data: formattedSurvey
    });
  } catch (error) {
    console.error('Error exporting survey for WordPress:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to export survey' 
    });
  }
});

// GET /api/wordpress/themes - Export themes for WordPress
router.get('/themes', auth, async (req, res) => {
  try {
    const themes = await query(`
      SELECT * FROM themes 
      WHERE user_id = ? OR is_default = 1
      ORDER BY is_default DESC, created_at DESC
    `, [req.user.id]);

    const formattedThemes = themes.rows.map(theme => ({
      id: theme.id,
      name: theme.name,
      description: theme.description,
      category: theme.category,
      colors: JSON.parse(theme.colors),
      typography: JSON.parse(theme.typography),
      layout: JSON.parse(theme.layout),
      components: JSON.parse(theme.components),
      is_default: theme.is_default === 1,
      is_premium: theme.is_premium === 1,
      created_at: theme.created_at,
      updated_at: theme.updated_at
    }));

    res.json({
      success: true,
      data: formattedThemes,
      count: formattedThemes.length
    });
  } catch (error) {
    console.error('Error exporting themes for WordPress:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to export themes' 
    });
  }
});

// POST /api/wordpress/import - Import data from WordPress
router.post('/import', auth, async (req, res) => {
  try {
    const { type, data } = req.body;
    
    if (type === 'survey') {
      // Import survey data
      const result = await query(`
        INSERT INTO surveys (user_id, title, description, status, settings, questions_data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, [
        req.user.id,
        data.title,
        data.description,
        data.status || 'draft',
        JSON.stringify(data.settings || {}),
        JSON.stringify(data.questions || [])
      ]);

      const surveyId = result.lastID;

      // Import questions
      if (data.questions && data.questions.length > 0) {
        for (const question of data.questions) {
          await query(`
            INSERT INTO questions (survey_id, question_text, question_type, options, required, order_index, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
          `, [
            surveyId,
            question.question_text,
            question.question_type,
            JSON.stringify(question.options || []),
            question.required ? 1 : 0,
            question.order_index || 0
          ]);
        }
      }

      res.json({
        success: true,
        message: 'Survey imported successfully',
        survey_id: surveyId
      });
    } else if (type === 'theme') {
      // Import theme data
      const result = await query(`
        INSERT INTO themes (user_id, name, description, category, colors, typography, layout, components, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, [
        req.user.id,
        data.name,
        data.description,
        data.category,
        JSON.stringify(data.colors),
        JSON.stringify(data.typography),
        JSON.stringify(data.layout),
        JSON.stringify(data.components)
      ]);

      res.json({
        success: true,
        message: 'Theme imported successfully',
        theme_id: result.lastID
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid import type'
      });
    }
  } catch (error) {
    console.error('Error importing data from WordPress:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to import data' 
    });
  }
});

module.exports = router;
