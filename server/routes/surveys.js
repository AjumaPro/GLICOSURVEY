const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');
const auth = require('../middleware/auth');

// GET /api/surveys - Get all surveys for a user
router.get('/', auth, async (req, res) => {
  try {
    const result = await query(
      `SELECT s.*, 
              COUNT(q.id) as question_count,
              COUNT(DISTINCT r.id) as response_count
       FROM surveys s
       LEFT JOIN questions q ON s.id = q.survey_id
       LEFT JOIN responses r ON s.id = r.survey_id
       WHERE s.user_id = $1
       GROUP BY s.id
       ORDER BY s.updated_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ error: 'Failed to fetch surveys' });
  }
});

// GET /api/surveys/:id - Get a specific survey with questions
router.get('/:id', async (req, res) => {
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

    const survey = surveyResult.rows[0];

    // Get questions for this survey
    const questionsResult = await query(
      'SELECT * FROM questions WHERE survey_id = $1 ORDER BY order_index ASC',
      [id]
    );

    survey.questions = questionsResult.rows;

    res.json(survey);
  } catch (error) {
    console.error('Error fetching survey:', error);
    res.status(500).json({ error: 'Failed to fetch survey' });
  }
});

// POST /api/surveys - Create a new survey
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, theme, settings, questions } = req.body;

    // Start a transaction
    const client = await query('BEGIN');

    // Create the survey
    const surveyResult = await query(
      `INSERT INTO surveys (title, description, user_id, theme, settings)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description, req.user.id, JSON.stringify(theme || {}), JSON.stringify(settings || {})]
    );

    const survey = surveyResult.rows[0];

    // Create questions if provided
    if (questions && Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        await query(
          `INSERT INTO questions (survey_id, type, title, description, required, options, settings, order_index)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            survey.id,
            question.type,
            question.title,
            question.description || '',
            question.required || false,
            JSON.stringify(question.options || []),
            JSON.stringify(question.settings || {}),
            i
          ]
        );
      }
    }

    await query('COMMIT');

    res.status(201).json(survey);
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error creating survey:', error);
    res.status(500).json({ error: 'Failed to create survey' });
  }
});

// PUT /api/surveys/:id - Update a survey
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, theme, settings, questions, status } = req.body;

    // Check if survey belongs to user
    const surveyCheck = await query(
      'SELECT id, title FROM surveys WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (surveyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Start a transaction
    await query('BEGIN');

    // Update survey with validation
    const surveyResult = await query(
      `UPDATE surveys 
       SET title = $1, description = $2, theme = $3, settings = $4, status = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [
        title || surveyCheck.rows[0].title || 'Untitled Survey', 
        description || '', 
        JSON.stringify(theme || {}), 
        JSON.stringify(settings || {}), 
        status || 'draft', 
        id
      ]
    );

    // Update questions if provided
    if (questions && Array.isArray(questions)) {
      // Delete existing questions
      await query('DELETE FROM questions WHERE survey_id = $1', [id]);

      // Insert new questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        await query(
          `INSERT INTO questions (survey_id, type, title, description, required, options, settings, order_index)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            id,
            question.type,
            question.title,
            question.description || '',
            question.required || false,
            JSON.stringify(question.options || []),
            JSON.stringify(question.settings || {}),
            i
          ]
        );
      }
    }

    await query('COMMIT');

    res.json(surveyResult.rows[0]);
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error updating survey:', error);
    res.status(500).json({ error: 'Failed to update survey' });
  }
});

// DELETE /api/surveys/:id - Delete a survey
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if survey belongs to user
    const surveyCheck = await query(
      'SELECT id FROM surveys WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (surveyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Delete survey (cascade will delete questions and responses)
    await query('DELETE FROM surveys WHERE id = $1', [id]);

    res.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    console.error('Error deleting survey:', error);
    res.status(500).json({ error: 'Failed to delete survey' });
  }
});

// GET /api/surveys/:id/responses - Get survey responses
router.get('/:id/responses', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if survey belongs to user
    const surveyCheck = await query(
      'SELECT id FROM surveys WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (surveyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Get responses with question details
    const result = await query(
      `SELECT r.*, q.title as question_title, q.type as question_type
       FROM responses r
       JOIN questions q ON r.question_id = q.id
       WHERE r.survey_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

// GET /api/surveys/public/:id - Get public survey (no auth required)
router.get('/public/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get survey details (only published surveys)
    const surveyResult = await query(
      'SELECT * FROM surveys WHERE id = $1 AND status = $2',
      [id, 'published']
    );

    if (surveyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found or not published' });
    }

    const survey = surveyResult.rows[0];

    // Get questions for this survey
    const questionsResult = await query(
      'SELECT * FROM questions WHERE survey_id = $1 ORDER BY order_index ASC',
      [id]
    );

    survey.questions = questionsResult.rows;

    res.json(survey);
  } catch (error) {
    console.error('Error fetching public survey:', error);
    res.status(500).json({ error: 'Failed to fetch survey' });
  }
});

// POST /api/surveys/:id/duplicate - Duplicate a survey
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if survey belongs to user
    const surveyResult = await query(
      'SELECT * FROM surveys WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (surveyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const originalSurvey = surveyResult.rows[0];

    // Start a transaction
    await query('BEGIN');

    // Create the duplicated survey
    const newSurveyResult = await query(
      `INSERT INTO surveys (title, description, user_id, theme, settings, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        `${originalSurvey.title} (Copy)`,
        originalSurvey.description,
        req.user.id,
        JSON.stringify(originalSurvey.theme),
        JSON.stringify(originalSurvey.settings),
        'draft'
      ]
    );

    const newSurvey = newSurveyResult.rows[0];

    // Get questions from original survey
    const questionsResult = await query(
      'SELECT * FROM questions WHERE survey_id = $1 ORDER BY order_index ASC',
      [id]
    );

    // Duplicate questions
    for (let i = 0; i < questionsResult.rows.length; i++) {
      const question = questionsResult.rows[i];
      await query(
        `INSERT INTO questions (survey_id, type, title, description, required, options, settings, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          newSurvey.id,
          question.type,
          question.title,
          question.description,
          question.required,
          JSON.stringify(question.options),
          JSON.stringify(question.settings),
          i
        ]
      );
    }

    await query('COMMIT');

    res.json(newSurvey);
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error duplicating survey:', error);
    res.status(500).json({ error: 'Failed to duplicate survey' });
  }
});

// GET /api/surveys/:id/share - Get share information for a survey
router.get('/:id/share', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if survey belongs to user and is published
    const surveyResult = await query(
      'SELECT * FROM surveys WHERE id = $1 AND user_id = $2 AND status = $3',
      [id, req.user.id, 'published']
    );

    if (surveyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found or not published' });
    }

    const survey = surveyResult.rows[0];
    
    // Generate a short share ID (6 characters)
    const shareId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Create share URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/survey/${shareId}`;
    const shortUrl = `${baseUrl}/s/${shareId}`;
    
    // Store the share mapping (you might want to create a separate table for this)
    // For now, we'll use the survey ID as the share ID
    const actualShareId = survey.id.toString();

    res.json({
      shareId: actualShareId,
      shareUrl: `${baseUrl}/survey/${actualShareId}`,
      shortUrl: `${baseUrl}/s/${actualShareId}`,
      surveyTitle: survey.title,
      surveyDescription: survey.description
    });
  } catch (error) {
    console.error('Error generating share info:', error);
    res.status(500).json({ error: 'Failed to generate share information' });
  }
});

module.exports = router; 