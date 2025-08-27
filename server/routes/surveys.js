const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');
const auth = require('../middleware/auth');

// GET /api/surveys - Get all surveys for a user (excluding soft deleted)
router.get('/', auth, async (req, res) => {
  try {
    let queryText, params;
    
    // If user has 'user' role (guest), show all surveys
    // If user has 'admin' or 'super_admin' role, show only their own surveys
    if (req.user.role === 'user') {
      queryText = `
        SELECT s.*, 
                u.name as author_name,
                COUNT(q.id) as question_count,
                COUNT(DISTINCT r.session_id) as responses_count
         FROM surveys s
         LEFT JOIN users u ON s.user_id = u.id
         LEFT JOIN questions q ON s.id = q.survey_id AND q.is_deleted = 0
         LEFT JOIN responses r ON s.id = r.survey_id
         WHERE s.is_deleted = 0
         GROUP BY s.id, u.name
         ORDER BY s.updated_at DESC
      `;
      params = [];
    } else {
      queryText = `
        SELECT s.*, 
                COUNT(q.id) as question_count,
                COUNT(DISTINCT r.session_id) as responses_count
         FROM surveys s
         LEFT JOIN questions q ON s.id = q.survey_id AND q.is_deleted = 0
         LEFT JOIN responses r ON s.id = r.survey_id
         WHERE s.user_id = ? AND s.is_deleted = 0
         GROUP BY s.id
         ORDER BY s.updated_at DESC
      `;
      params = [req.user.id];
    }

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ error: 'Failed to fetch surveys' });
  }
});

// GET /api/surveys/deleted - Get soft deleted surveys for a user
router.get('/deleted', auth, async (req, res) => {
  try {
    let queryText, params;
    
    // If user has 'user' role (guest), show all deleted surveys
    // If user has 'admin' or 'super_admin' role, show only their own deleted surveys
    if (req.user.role === 'user') {
      queryText = `
        SELECT s.*, 
                u.name as author_name,
                COUNT(q.id) as question_count,
                COUNT(DISTINCT r.session_id) as responses_count
         FROM surveys s
         LEFT JOIN users u ON s.user_id = u.id
         LEFT JOIN questions q ON s.id = q.survey_id AND q.is_deleted = 0
         LEFT JOIN responses r ON s.id = r.survey_id
         WHERE s.is_deleted = 1
         GROUP BY s.id, u.name
         ORDER BY s.deleted_at DESC
      `;
      params = [];
    } else {
      queryText = `
        SELECT s.*, 
                COUNT(q.id) as question_count,
                COUNT(DISTINCT r.session_id) as responses_count
         FROM surveys s
         LEFT JOIN questions q ON s.id = q.survey_id AND q.is_deleted = 0
         LEFT JOIN responses r ON s.id = r.survey_id
         WHERE s.user_id = ? AND s.is_deleted = 1
         GROUP BY s.id
         ORDER BY s.deleted_at DESC
      `;
      params = [req.user.id];
    }

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching deleted surveys:', error);
    res.status(500).json({ error: 'Failed to fetch deleted surveys' });
  }
});

// GET /api/surveys/public/:id - Get a published survey for public access
router.get('/public/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get survey with questions (only if published and not deleted)
    const surveyResult = await query(
      `SELECT s.*, u.name as author_name
       FROM surveys s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = ? AND s.status = 'published' AND s.is_deleted = 0`,
      [id]
    );

    if (surveyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found or not published' });
    }

    const survey = surveyResult.rows[0];

    // Get questions
    const questionsResult = await query(
      `SELECT id, type, title, description, required, options, settings, order_index
       FROM questions 
       WHERE survey_id = ? AND is_deleted = 0
       ORDER BY order_index ASC`,
      [id]
    );

    survey.questions = questionsResult.rows.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      settings: typeof q.settings === 'string' ? JSON.parse(q.settings) : q.settings
    }));

    res.json(survey);
  } catch (error) {
    console.error('Error fetching public survey:', error);
    res.status(500).json({ error: 'Failed to fetch survey' });
  }
});

// GET /api/surveys/:id - Get a specific survey with questions (excluding soft deleted)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get survey details with response count
    const surveyResult = await query(
      `SELECT s.*, COUNT(DISTINCT r.session_id) as responses_count
       FROM surveys s
       LEFT JOIN responses r ON s.id = r.survey_id
       WHERE s.id = ? AND s.is_deleted = 0
       GROUP BY s.id`,
      [id]
    );

    if (surveyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const survey = surveyResult.rows[0];

    // Get questions for this survey (excluding soft deleted)
    const questionsResult = await query(
      'SELECT * FROM questions WHERE survey_id = ? AND is_deleted = 0 ORDER BY order_index ASC',
      [id]
    );

    // Transform question data to match frontend expectations
    survey.questions = questionsResult.rows.map(question => ({
      ...question,
      type: question.question_type,
      title: question.question_text,
      options: typeof question.options === 'string' ? JSON.parse(question.options) : question.options
    }));

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
    // SQLite3 transactions are handled differently

    // Create the survey
    await query(
      `INSERT INTO surveys (title, description, user_id, theme, settings, questions_data)
       VALUES (?, ?, ?, ?, ?, ?)
       `,
      [title, description, req.user.id, JSON.stringify(theme || {}), JSON.stringify(settings || {}), JSON.stringify(questions || [])]
    );

    // Get the created survey (SQLite3 doesn't support RETURNING)
    const surveyResult = await query(
      'SELECT * FROM surveys WHERE id = last_insert_rowid()'
    );
    const survey = surveyResult.rows[0];

    // Create questions if provided
    if (questions && Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        await query(
          `INSERT INTO questions (survey_id, question_type, question_text, required, options, order_index)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            survey.id,
            question.question_type,
            question.question_text,
            question.required || false,
            JSON.stringify(question.options || []),
            i
          ]
        );
      }
    }

    // Create initial version
    await query(
      `INSERT INTO survey_versions (survey_id, version_number, title, description, theme, settings, questions_data, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        survey.id,
        1,
        survey.title,
        survey.description,
        survey.theme,
        survey.settings,
        JSON.stringify(questions || []),
        req.user.id
      ]
    );

    // SQLite3 transactions are handled differently

    res.status(201).json(survey);
  } catch (error) {
    // SQLite3 transactions are handled differently
    console.error('Error creating survey:', error);
    res.status(500).json({ error: 'Failed to create survey' });
  }
});

// PUT /api/surveys/:id - Update a survey
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, theme, settings, questions, status } = req.body;

    // Check if survey belongs to user and is not deleted
    const surveyCheck = await query(
      'SELECT id, title FROM surveys WHERE id = ? AND user_id = ? AND is_deleted = 0',
      [id, req.user.id]
    );

    if (surveyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Start a transaction
    // SQLite3 transactions are handled differently

    // Update survey with validation
    await query(
      `UPDATE surveys 
       SET title = ?, description = ?, theme = ?, settings = ?, status = ?, updated_at = datetime('now')
       WHERE id = ?
       `,
      [
        title || surveyCheck.rows[0].title || 'Untitled Survey', 
        description || '', 
        JSON.stringify(theme || {}), 
        JSON.stringify(settings || {}), 
        status || 'draft', 
        id
      ]
    );

    // Get the updated survey (SQLite3 doesn't support RETURNING)
    const surveyResult = await query(
      'SELECT * FROM surveys WHERE id = ?',
      [id]
    );

    // Update questions if provided
    if (questions && Array.isArray(questions)) {
      // Soft delete existing questions
      await query('UPDATE questions SET is_deleted = 1, deleted_at = datetime(\'now\') WHERE survey_id = ?', [id]);

      // Insert new questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        await query(
          `INSERT INTO questions (survey_id, type, title, description, required, options, settings, order_index)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            question.question_type,
            question.question_text,
            question.description || '',
            question.required || false,
            JSON.stringify(question.options || []),
            JSON.stringify(question.settings || {}),
            i
          ]
        );
      }
    }

    // Create new version
    const versionResult = await query(
      'SELECT COALESCE(MAX(version_number), 0) + 1 as next_version FROM survey_versions WHERE survey_id = ?',
      [id]
    );
    const nextVersion = versionResult.rows[0].next_version;

    await query(
      `INSERT INTO survey_versions (survey_id, version_number, title, description, theme, settings, questions_data, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        nextVersion,
        surveyResult.rows[0].title,
        surveyResult.rows[0].description,
        surveyResult.rows[0].theme,
        surveyResult.rows[0].settings,
        JSON.stringify(questions || []),
        req.user.id
      ]
    );

    // SQLite3 transactions are handled differently

    res.json(surveyResult.rows[0]);
  } catch (error) {
    // SQLite3 transactions are handled differently
    console.error('Error updating survey:', error);
    res.status(500).json({ error: 'Failed to update survey' });
  }
});

// DELETE /api/surveys/:id - Soft delete a survey
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if survey belongs to user and is not already deleted
    const surveyCheck = await query(
      'SELECT id FROM surveys WHERE id = ? AND user_id = ? AND is_deleted = 0',
      [id, req.user.id]
    );

    if (surveyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Soft delete survey
    await query(
      'UPDATE surveys SET is_deleted = 1, deleted_at = datetime(\'now\'), deleted_by = ? WHERE id = ?',
      [req.user.id, id]
    );

    // Soft delete all questions for this survey
    await query(
      'UPDATE questions SET is_deleted = 1, deleted_at = datetime(\'now\') WHERE survey_id = ?',
      [id]
    );

    res.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    console.error('Error deleting survey:', error);
    res.status(500).json({ error: 'Failed to delete survey' });
  }
});

// POST /api/surveys/:id/restore - Restore a soft deleted survey
router.post('/:id/restore', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if survey belongs to user and is deleted
    const surveyCheck = await query(
      'SELECT id FROM surveys WHERE id = ? AND user_id = ? AND is_deleted = 1',
      [id, req.user.id]
    );

    if (surveyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Deleted survey not found' });
    }

    // Restore survey
    await query(
      'UPDATE surveys SET is_deleted = 0, deleted_at = NULL, deleted_by = NULL WHERE id = ?',
      [id]
    );

    // Restore all questions for this survey
    await query(
      'UPDATE questions SET is_deleted = 0, deleted_at = NULL WHERE survey_id = ?',
      [id]
    );

    res.json({ message: 'Survey restored successfully' });
  } catch (error) {
    console.error('Error restoring survey:', error);
    res.status(500).json({ error: 'Failed to restore survey' });
  }
});

// DELETE /api/surveys/:id/permanent - Permanently delete a survey (admin only)
router.delete('/:id/permanent', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin
    const userCheck = await query(
      'SELECT role FROM users WHERE id = ?',
      [req.user.id]
    );

    if (userCheck.rows.length === 0 || !['admin', 'super_admin'].includes(userCheck.rows[0].role)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Check if survey exists
    const surveyCheck = await query(
      'SELECT id FROM surveys WHERE id = ?',
      [id]
    );

    if (surveyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Permanently delete survey (cascade will delete questions, responses, and versions)
    await query('DELETE FROM surveys WHERE id = ?', [id]);

    res.json({ message: 'Survey permanently deleted' });
  } catch (error) {
    console.error('Error permanently deleting survey:', error);
    res.status(500).json({ error: 'Failed to permanently delete survey' });
  }
});

// GET /api/surveys/:id/versions - Get survey versions
router.get('/:id/versions', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if survey belongs to user
    const surveyCheck = await query(
      'SELECT id FROM surveys WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (surveyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Get all versions
    const versionsResult = await query(
      'SELECT * FROM survey_versions WHERE survey_id = ? ORDER BY version_number DESC',
      [id]
    );

    res.json(versionsResult.rows);
  } catch (error) {
    console.error('Error fetching survey versions:', error);
    res.status(500).json({ error: 'Failed to fetch survey versions' });
  }
});

// POST /api/surveys/:id/restore-version/:version - Restore a specific version
router.post('/:id/restore-version/:version', auth, async (req, res) => {
  try {
    const { id, version } = req.params;

    // Check if survey belongs to user
    const surveyCheck = await query(
      'SELECT id FROM surveys WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (surveyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Get the specific version
    const versionResult = await query(
      'SELECT * FROM survey_versions WHERE survey_id = ? AND version_number = ?',
      [id, version]
    );

    if (versionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Version not found' });
    }

    const versionData = versionResult.rows[0];

    // Start a transaction
    // SQLite3 transactions are handled differently

    // Update survey with version data
    await query(
      `UPDATE surveys 
       SET title = ?, description = ?, theme = ?, settings = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [versionData.title, versionData.description, versionData.theme, versionData.settings, id]
    );

    // Soft delete current questions
    await query(
      'UPDATE questions SET is_deleted = 1, deleted_at = datetime(\'now\') WHERE survey_id = ?',
      [id]
    );

    // Restore questions from version
    const questions = JSON.parse(versionData.questions_data);
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      await query(
        `INSERT INTO questions (survey_id, type, title, description, required, options, settings, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          question.question_type,
          question.question_text,
          question.description || '',
          question.required || false,
          JSON.stringify(question.options || []),
          JSON.stringify(question.settings || {}),
          i
        ]
      );
    }

    // SQLite3 transactions are handled differently

    res.json({ message: 'Version restored successfully' });
  } catch (error) {
    // SQLite3 transactions are handled differently
    console.error('Error restoring version:', error);
    res.status(500).json({ error: 'Failed to restore version' });
  }
});

// GET /api/surveys/:id/share - Get survey share information
router.get('/:id/share', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if survey exists and is published
    const surveyResult = await query(
      'SELECT id, title, description FROM surveys WHERE id = ? AND status = ? AND is_deleted = 0',
      [id, 'published']
    );

    if (surveyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found or not published' });
    }

    const survey = surveyResult.rows[0];
    
    // Generate URLs
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/survey/${id}`;
    const shortUrl = `${baseUrl}/s/${id}`; // Short URL format
    
    res.json({
      surveyId: survey.id,
      surveyTitle: survey.title,
      shareUrl: shareUrl,
      shortUrl: shortUrl,
      qrCodeData: shareUrl
    });
  } catch (error) {
    console.error('Error generating share info:', error);
    res.status(500).json({ error: 'Failed to generate share information' });
  }
});

// POST /api/surveys/:id/publish - Publish a survey
router.post('/:id/publish', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if survey belongs to user and is not deleted
    const surveyCheck = await query(
      'SELECT id, status FROM surveys WHERE id = ? AND user_id = ? AND is_deleted = 0',
      [id, req.user.id]
    );

    if (surveyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const survey = surveyCheck.rows[0];

    // Check if survey is already published
    if (survey.status === 'published') {
      return res.status(400).json({ error: 'Survey is already published' });
    }

    // Check if survey has questions
    const questionsCheck = await query(
      'SELECT COUNT(*) as question_count FROM questions WHERE survey_id = ? AND is_deleted = 0',
      [id]
    );

    if (parseInt(questionsCheck.rows[0].question_count) === 0) {
      return res.status(400).json({ error: 'Cannot publish survey without questions' });
    }

    // Publish the survey
    await query(
      'UPDATE surveys SET status = ?, updated_at = datetime(\'now\') WHERE id = ?',
      ['published', id]
    );

    res.json({ 
      message: 'Survey published successfully',
      survey: { id, status: 'published' }
    });
  } catch (error) {
    console.error('Error publishing survey:', error);
    res.status(500).json({ error: 'Failed to publish survey' });
  }
});

// POST /api/surveys/:id/unpublish - Unpublish a survey
router.post('/:id/unpublish', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if survey belongs to user and is not deleted
    const surveyCheck = await query(
      'SELECT id, status FROM surveys WHERE id = ? AND user_id = ? AND is_deleted = 0',
      [id, req.user.id]
    );

    if (surveyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const survey = surveyCheck.rows[0];

    // Check if survey is already unpublished
    if (survey.status === 'draft') {
      return res.status(400).json({ error: 'Survey is already unpublished' });
    }

    // Unpublish the survey
    await query(
      'UPDATE surveys SET status = ?, updated_at = datetime(\'now\') WHERE id = ?',
      ['draft', id]
    );

    res.json({ 
      message: 'Survey unpublished successfully',
      survey: { id, status: 'draft' }
    });
  } catch (error) {
    console.error('Error unpublishing survey:', error);
    res.status(500).json({ error: 'Failed to unpublish survey' });
  }
});

module.exports = router; 