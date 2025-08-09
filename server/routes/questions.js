const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');
const auth = require('../middleware/auth');

// GET /api/questions/survey/:id - Get all questions for a survey
router.get('/survey/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'SELECT * FROM questions WHERE survey_id = $1 ORDER BY order_index ASC',
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// POST /api/questions - Create a new question
router.post('/', auth, async (req, res) => {
  try {
    const { surveyId, type, title, description, required, options, settings, orderIndex } = req.body;

    // Verify survey belongs to user
    const surveyCheck = await query(
      'SELECT id FROM surveys WHERE id = $1 AND user_id = $2',
      [surveyId, req.user.id]
    );

    if (surveyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const result = await query(
      `INSERT INTO questions (survey_id, type, title, description, required, options, settings, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        surveyId,
        type,
        title,
        description || '',
        required || false,
        JSON.stringify(options || []),
        JSON.stringify(settings || {}),
        orderIndex || 0
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// PUT /api/questions/:id - Update a question
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, description, required, options, settings, orderIndex } = req.body;

    // Verify question belongs to user's survey
    const questionCheck = await query(
      `SELECT q.id FROM questions q
       JOIN surveys s ON q.survey_id = s.id
       WHERE q.id = $1 AND s.user_id = $2`,
      [id, req.user.id]
    );

    if (questionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const result = await query(
      `UPDATE questions 
       SET type = $1, title = $2, description = $3, required = $4, 
           options = $5, settings = $6, order_index = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [
        type,
        title,
        description || '',
        required || false,
        JSON.stringify(options || []),
        JSON.stringify(settings || {}),
        orderIndex || 0,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// DELETE /api/questions/:id - Delete a question
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify question belongs to user's survey
    const questionCheck = await query(
      `SELECT q.id FROM questions q
       JOIN surveys s ON q.survey_id = s.id
       WHERE q.id = $1 AND s.user_id = $2`,
      [id, req.user.id]
    );

    if (questionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    await query('DELETE FROM questions WHERE id = $1', [id]);

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// PUT /api/questions/reorder - Reorder questions
router.put('/reorder', auth, async (req, res) => {
  try {
    const { surveyId, questionIds } = req.body;

    // Verify survey belongs to user
    const surveyCheck = await query(
      'SELECT id FROM surveys WHERE id = $1 AND user_id = $2',
      [surveyId, req.user.id]
    );

    if (surveyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Start transaction
    await query('BEGIN');

    try {
      // Update order for each question
      for (let i = 0; i < questionIds.length; i++) {
        await query(
          'UPDATE questions SET order_index = $1 WHERE id = $2 AND survey_id = $3',
          [i, questionIds[i], surveyId]
        );
      }

      await query('COMMIT');
      res.json({ message: 'Questions reordered successfully' });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error reordering questions:', error);
    res.status(500).json({ error: 'Failed to reorder questions' });
  }
});

module.exports = router; 