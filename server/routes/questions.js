const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');
const auth = require('../middleware/auth');

// GET /api/questions/survey/:id - Get all questions for a survey
router.get('/survey/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'SELECT * FROM questions WHERE survey_id = ? ORDER BY order_index ASC',
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
      'SELECT id FROM surveys WHERE id = ? AND user_id = ?',
      [surveyId, parseInt(req.user.id)]
    );

    if (surveyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const result = await query(
      `INSERT INTO questions (survey_id, question_type, question_text, description, required, options, settings, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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
       WHERE q.id = ? AND s.user_id = ?`,
      [id, parseInt(req.user.id)]
    );

    if (questionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const result = await query(
      `UPDATE questions 
       SET question_type = ?, question_text = ?, description = ?, required = ?, 
           options = ?, settings = ?, order_index = ?, updated_at = datetime('now')
       WHERE id = ?`,
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
       WHERE q.id = ? AND s.user_id = ?`,
      [id, parseInt(req.user.id)]
    );

    if (questionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    await query('DELETE FROM questions WHERE id = ?', [id]);

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
      'SELECT id FROM surveys WHERE id = ? AND user_id = ?',
      [surveyId, parseInt(req.user.id)]
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
          'UPDATE questions SET order_index = ? WHERE id = ? AND survey_id = ?',
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