const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');
const auth = require('../middleware/auth');

// Middleware to ensure user ID is always an integer
const ensureIntegerUserId = (req, res, next) => {
  if (req.user && req.user.id) {
    console.log('Middleware: Original req.user.id:', req.user.id, 'Type:', typeof req.user.id);
    req.user.id = Math.floor(Number(req.user.id));
    console.log('Middleware: Converted req.user.id:', req.user.id, 'Type:', typeof req.user.id);
    if (isNaN(req.user.id) || req.user.id <= 0) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    // Also ensure the user ID in the database query is converted
    if (req.user.id !== Math.floor(Number(req.user.id))) {
      req.user.id = Math.floor(Number(req.user.id));
    }
  }
  next();
};

// Function to fix database data types
const fixDatabaseDataTypes = async () => {
  try {
    console.log('Starting aggressive database cleanup...');
    
    // Force update all surveys to use integer user IDs
    await query('UPDATE surveys SET user_id = CAST(user_id AS INTEGER)');
    console.log('Updated all survey user_ids to integers');
    
    // Force update all questions to use integer survey IDs
    await query('UPDATE questions SET survey_id = CAST(survey_id AS INTEGER)');
    console.log('Updated all question survey_ids to integers');
    
    // Force update all question required fields to integers
    await query('UPDATE questions SET required = CASE WHEN required = 1 OR required = true THEN 1 ELSE 0 END');
    console.log('Updated all question required fields to integers');
    
    // Force update all question order_index fields to integers
    await query('UPDATE questions SET order_index = CAST(order_index AS INTEGER)');
    console.log('Updated all question order_index fields to integers');
    
    // Verify the changes
    const surveysCheck = await query('SELECT COUNT(*) as count FROM surveys WHERE user_id IS NOT CAST(user_id AS INTEGER)');
    const questionsCheck = await query('SELECT COUNT(*) as count FROM questions WHERE survey_id IS NOT CAST(survey_id AS INTEGER)');
    
    console.log(`Verification: ${surveysCheck.rows[0].count} surveys with non-integer user_ids, ${questionsCheck.rows[0].count} questions with non-integer survey_ids`);
    
    console.log('Aggressive database cleanup completed successfully');
  } catch (error) {
    console.error('Error during aggressive database cleanup:', error);
  }
};

// GET /api/surveys - Get all surveys for a user (excluding soft deleted)
router.get('/', auth, ensureIntegerUserId, async (req, res) => {
  try {
    // Fix database data types on first request
    await fixDatabaseDataTypes();
    let queryText, params;
    
    // Get status filter from query parameter
    const statusFilter = req.query.status;
    
    // If user has 'user' role (guest), show all surveys
    // If user has 'admin' or 'super_admin' role, show only their own surveys
    if (req.user.role === 'user') {
      queryText = `
        SELECT s.*, 
                u.full_name as author_name,
                COUNT(q.id) as question_count,
                COUNT(DISTINCT r.session_id) as responses_count
         FROM surveys s
         LEFT JOIN users u ON s.user_id = u.id
         LEFT JOIN questions q ON s.id = q.survey_id AND q.is_deleted = 0
         LEFT JOIN responses r ON s.id = r.survey_id
         WHERE s.is_deleted = 0
         ${statusFilter ? 'AND s.status = ?' : ''}
         GROUP BY s.id, u.full_name
         ORDER BY s.updated_at DESC
      `;
      params = statusFilter ? [statusFilter] : [];
    } else {
      queryText = `
        SELECT s.*, 
                COUNT(q.id) as question_count,
                COUNT(DISTINCT r.session_id) as responses_count
         FROM surveys s
         LEFT JOIN questions q ON s.id = q.survey_id AND q.is_deleted = 0
         LEFT JOIN responses r ON s.id = r.survey_id
         WHERE s.user_id = ? AND s.is_deleted = 0
         ${statusFilter ? 'AND s.status = ?' : ''}
         GROUP BY s.id
         ORDER BY s.updated_at DESC
      `;
      params = statusFilter ? [req.user.id, statusFilter] : [req.user.id];
    }

    const result = await query(queryText, params);
    console.log('All surveys result count:', result.rows.length);
    console.log('All surveys statuses:', result.rows.map(s => ({ id: s.id, title: s.title, status: s.status })));
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ error: 'Failed to fetch surveys' });
  }
});

// GET /api/surveys/published - Get all published surveys for a user
router.get('/published', auth, ensureIntegerUserId, async (req, res) => {
  try {
    // Fix database data types on first request
    await fixDatabaseDataTypes();
    
    console.log('Published surveys request - User:', req.user.id, 'Role:', req.user.role);
    
    let queryText, params;
    
    // If user has 'user' role (guest), show all published surveys
    // If user has 'admin' or 'super_admin' role, show only their own published surveys
    if (req.user.role === 'user') {
      queryText = `
        SELECT s.*, 
                u.full_name as author_name,
                COUNT(q.id) as question_count,
                COUNT(DISTINCT r.session_id) as responses_count
         FROM surveys s
         LEFT JOIN users u ON s.user_id = u.id
         LEFT JOIN questions q ON s.id = q.survey_id AND q.is_deleted = 0
         LEFT JOIN responses r ON s.id = r.survey_id
         WHERE s.status = 'published' AND s.is_deleted = 0
         GROUP BY s.id, u.full_name
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
         WHERE s.user_id = ? AND s.status = 'published' AND s.is_deleted = 0
         GROUP BY s.id
         ORDER BY s.updated_at DESC
      `;
      params = [req.user.id];
    }

    console.log('Published surveys query:', queryText);
    console.log('Published surveys params:', params);

    const result = await query(queryText, params);
    console.log('Published surveys result count:', result.rows.length);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching published surveys:', error);
    res.status(500).json({ error: 'Failed to fetch published surveys' });
  }
});

// GET /api/surveys/deleted - Get soft deleted surveys for a user
router.get('/deleted', auth, ensureIntegerUserId, async (req, res) => {
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
      `SELECT s.*, u.full_name as author_name
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
      `SELECT id, question_type, question_text, required, options, order_index
       FROM questions 
       WHERE survey_id = ? AND is_deleted = 0
       ORDER BY order_index ASC`,
      [id]
    );

    survey.questions = questionsResult.rows.map(q => ({
      ...q,
      type: q.question_type,
      title: q.question_text,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));

    res.json(survey);
  } catch (error) {
    console.error('Error fetching public survey:', error);
    res.status(500).json({ error: 'Failed to fetch survey' });
  }
});

// GET /api/surveys/preview/:id - Get a survey for preview (including drafts)
router.get('/preview/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get survey with questions (including drafts, but not deleted)
    const surveyResult = await query(
      `SELECT s.*, u.full_name as author_name
       FROM surveys s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = ? AND s.is_deleted = 0`,
      [id]
    );

    if (surveyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const survey = surveyResult.rows[0];

    // Get questions for this survey
    const questionsResult = await query(
      `SELECT * FROM questions 
       WHERE survey_id = ? AND is_deleted = 0 
       ORDER BY order_index ASC`,
      [id]
    );

    // Format questions for frontend
    survey.questions = questionsResult.rows.map(q => ({
      id: q.id,
      type: q.question_type,
      title: q.question_text,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));

    res.json(survey);
  } catch (error) {
    console.error('Error fetching survey for preview:', error);
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

// GET /api/surveys/:id/questions - Get questions for a specific survey
router.get('/:id/questions', auth, ensureIntegerUserId, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if survey belongs to user and is not deleted
    const surveyCheck = await query(
      'SELECT id FROM surveys WHERE id = ? AND user_id = ? AND is_deleted = 0',
      [id, req.user.id]
    );

    if (surveyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    // Get questions for this survey
    const questionsResult = await query(
      'SELECT * FROM questions WHERE survey_id = ? AND is_deleted = 0 ORDER BY order_index ASC',
      [id]
    );

    res.json(questionsResult.rows);
  } catch (error) {
    console.error('Error fetching survey questions:', error);
    res.status(500).json({ error: 'Failed to fetch survey questions' });
  }
});

// POST /api/surveys - Create a new survey
router.post('/', auth, ensureIntegerUserId, async (req, res) => {
  try {
    const { title, description, theme, settings, questions } = req.body;

    // Start a transaction
    // SQLite3 transactions are handled differently

    // Force user ID to be an integer (handle old JWT tokens with float values)
    const userId = Math.floor(Number(req.user.id));
    
    // Validate user ID
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Create the survey
    await query(
      `INSERT INTO surveys (title, description, user_id, theme, settings, questions_data)
       VALUES (?, ?, ?, ?, ?, ?)
       `,
      [title, description, userId, JSON.stringify(theme || {}), JSON.stringify(settings || {}), JSON.stringify(questions || [])]
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
        
        // Validate and support all question types including emoji
        let questionType = String(question.question_type || 'text');
        const validQuestionTypes = [
          // Basic Question Types
          'text', 'textarea', 'multiple_choice', 'checkbox',
          // Rating & Scale Questions
          'emoji_scale', 'likert_scale', 'star_rating', 'thumbs_rating', 'slider',
          // Number & Date Questions
          'number', 'date', 'time', 'currency', 'percentage',
          // Contact & Personal Info
          'email', 'phone', 'address', 'contact_followup',
          // File & Media
          'image_upload', 'file_upload',
          // Yes/No & Boolean
          'yes_no', 'boolean',
          // Legacy types for backward compatibility
          'radio', 'select', 'emoji', 'rating', 'scale', 'matrix'
        ];
        if (!validQuestionTypes.includes(questionType)) {
          console.warn(`Invalid question type: ${questionType}, defaulting to 'text'`);
          questionType = 'text';
        }
        
        // Special handling for different question types
        if (questionType === 'emoji' || questionType === 'emoji_scale') {
          // Ensure emoji questions have proper options
          if (!question.options || question.options.length === 0) {
            question.options = [
              { value: 1, label: '😢', text: 'Very Sad' },
              { value: 2, label: '😕', text: 'Sad' },
              { value: 3, label: '😐', text: 'Neutral' },
              { value: 4, label: '🙂', text: 'Happy' },
              { value: 5, label: '😄', text: 'Very Happy' }
            ];
          }
        } else if (questionType === 'rating' || questionType === 'star_rating') {
          // Ensure rating questions have proper options
          if (!question.options || question.options.length === 0) {
            question.options = [
              { value: 1, label: '1', text: 'Poor' },
              { value: 2, label: '2', text: 'Fair' },
              { value: 3, label: '3', text: 'Good' },
              { value: 4, label: '4', text: 'Very Good' },
              { value: 5, label: '5', text: 'Excellent' }
            ];
          }
        } else if (questionType === 'scale' || questionType === 'likert_scale') {
          // Ensure scale questions have proper options
          if (!question.options || question.options.length === 0) {
            question.options = [
              { value: 1, label: '1', text: 'Strongly Disagree' },
              { value: 2, label: '2', text: 'Disagree' },
              { value: 3, label: '3', text: 'Neutral' },
              { value: 4, label: '4', text: 'Agree' },
              { value: 5, label: '5', text: 'Strongly Agree' }
            ];
          }
        } else if (questionType === 'multiple_choice' || questionType === 'checkbox') {
          // Ensure multiple choice questions have proper options
          if (!question.options || question.options.length === 0) {
            question.options = ['Option 1', 'Option 2', 'Option 3'];
          }
        } else if (questionType === 'yes_no') {
          // Ensure yes/no questions have proper options
          if (!question.options || question.options.length === 0) {
            question.options = ['Yes', 'No'];
          }
        } else if (questionType === 'boolean') {
          // Ensure boolean questions have proper options
          if (!question.options || question.options.length === 0) {
            question.options = ['True', 'False'];
          }
        } else if (questionType === 'radio' || questionType === 'select') {
          // Ensure choice-based questions have options
          if (!question.options || question.options.length === 0) {
            question.options = [
              { value: 1, label: 'Option 1', text: 'First Option' },
              { value: 2, label: '2', text: 'Second Option' },
              { value: 3, label: '3', text: 'Third Option' }
            ];
          }
        }
        
        // Force all values to be proper types before insertion
        const finalSurveyId = parseInt(survey.id);
        const finalRequired = question.required === true ? 1 : 0;
        const finalOrderIndex = parseInt(i) || 0;
        
        console.log('Final question data for creation:', {
          surveyId: finalSurveyId,
          questionType,
          questionText: String(question.question_text || ''),
          required: finalRequired,
          options: JSON.stringify(question.options || []),
          orderIndex: finalOrderIndex
        });
        
        // Use explicit SQL to ensure proper types
        const insertSql = `INSERT INTO questions (survey_id, question_type, question_text, required, options, order_index)
                          VALUES (?, ?, ?, ?, ?, ?)`;
        
        await query(insertSql, [
          finalSurveyId,
          questionType,
          String(question.question_text || ''),
          finalRequired,
            JSON.stringify(question.options || []),
          finalOrderIndex
        ]);
      }
    }

    // Create initial version (commented out - table doesn't exist)
    // await query(
    //   `INSERT INTO survey_versions (survey_id, version_number, title, description, theme, settings, questions_data, created_by)
    //    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    //   [
    //     parseInt(survey.id),
    //     1,
    //     survey.title,
    //     survey.description,
    //     survey.theme,
    //     survey.settings,
    //     JSON.stringify(questions || []),
    //     userId
    //   ]
    // );

    // SQLite3 transactions are handled differently

    res.status(201).json(survey);
  } catch (error) {
    // SQLite3 transactions are handled differently
    console.error('Error creating survey:', error);
    res.status(500).json({ error: 'Failed to create survey' });
  }
});

// PUT /api/surveys/:id - Update a survey
router.put('/:id', auth, ensureIntegerUserId, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, theme, settings, questions, status } = req.body;

    // Check if survey belongs to user and is not deleted
    const userId = Math.floor(Number(req.user.id));
    const surveyCheck = await query(
      'SELECT id, title FROM surveys WHERE id = ? AND user_id = ? AND is_deleted = 0',
      [id, userId]
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
        
        // Validate and sanitize question data with explicit type conversion
        const surveyId = parseInt(id);
        let questionType = String(question.question_type || 'text');
        const questionText = String(question.question_text || '');
        const options = JSON.stringify(question.options || []);
        const required = question.required === true ? 1 : 0;
        const orderIndex = parseInt(i) || 0;
        
        // Validate and support all question types including emoji
        const validQuestionTypes = [
          // Basic Question Types
          'text', 'textarea', 'multiple_choice', 'checkbox',
          // Rating & Scale Questions
          'emoji_scale', 'likert_scale', 'star_rating', 'thumbs_rating', 'slider',
          // Number & Date Questions
          'number', 'date', 'time', 'currency', 'percentage',
          // Contact & Personal Info
          'email', 'phone', 'address', 'contact_followup',
          // File & Media
          'image_upload', 'file_upload',
          // Yes/No & Boolean
          'yes_no', 'boolean',
          // Legacy types for backward compatibility
          'radio', 'select', 'emoji', 'rating', 'scale', 'matrix'
        ];
        if (!validQuestionTypes.includes(questionType)) {
          console.warn(`Invalid question type: ${questionType}, defaulting to 'text'`);
          questionType = 'text';
        }
        
        // Special handling for different question types
        if (questionType === 'emoji' || questionType === 'emoji_scale') {
          // Ensure emoji questions have proper options
          if (!question.options || question.options.length === 0) {
            question.options = [
              { value: 1, label: '😢', text: 'Very Sad' },
              { value: 2, label: '😕', text: 'Sad' },
              { value: 3, label: '😐', text: 'Neutral' },
              { value: 4, label: '🙂', text: 'Happy' },
              { value: 5, label: '😄', text: 'Very Happy' }
            ];
          }
        } else if (questionType === 'rating' || questionType === 'star_rating') {
          // Ensure rating questions have proper options
          if (!question.options || question.options.length === 0) {
            question.options = [
              { value: 1, label: '1', text: 'Poor' },
              { value: 2, label: '2', text: 'Fair' },
              { value: 3, label: '3', text: 'Good' },
              { value: 4, label: '4', text: 'Very Good' },
              { value: 5, label: '5', text: 'Excellent' }
            ];
          }
        } else if (questionType === 'scale' || questionType === 'likert_scale') {
          // Ensure scale questions have proper options
          if (!question.options || question.options.length === 0) {
            question.options = [
              { value: 1, label: '1', text: 'Strongly Disagree' },
              { value: 2, label: '2', text: 'Disagree' },
              { value: 3, label: '3', text: 'Neutral' },
              { value: 4, label: '4', text: 'Agree' },
              { value: 5, label: '5', text: 'Strongly Agree' }
            ];
          }
        } else if (questionType === 'multiple_choice' || questionType === 'checkbox') {
          // Ensure multiple choice questions have proper options
          if (!question.options || question.options.length === 0) {
            question.options = ['Option 1', 'Option 2', 'Option 3'];
          }
        } else if (questionType === 'yes_no') {
          // Ensure yes/no questions have proper options
          if (!question.options || question.options.length === 0) {
            question.options = ['Yes', 'No'];
          }
        } else if (questionType === 'boolean') {
          // Ensure boolean questions have proper options
          if (!question.options || question.options.length === 0) {
            question.options = ['True', 'False'];
          }
        }
        
        console.log('Inserting question with data:', {
          surveyId,
          questionType,
          questionText,
          options,
          required,
          orderIndex
        });
        
        // Force all values to be proper types before insertion
        const finalSurveyId = parseInt(surveyId);
        const finalRequired = required === true || required === 1 ? 1 : 0;
        const finalOrderIndex = parseInt(orderIndex);
        
        console.log('Final question data for insertion:', {
          surveyId: finalSurveyId,
          questionType,
          questionText,
          options,
          required: finalRequired,
          orderIndex: finalOrderIndex
        });
        
        // Use explicit SQL to ensure proper types
        const insertSql = `INSERT INTO questions (survey_id, question_type, question_text, options, required, order_index)
                          VALUES (?, ?, ?, ?, ?, ?)`;
        
        await query(insertSql, [
          finalSurveyId,
          questionType,
          questionText,
          options,
          finalRequired,
          finalOrderIndex
        ]);
      }
    }

    // Create new version (commented out - table doesn't exist)
    // const versionResult = await query(
    //   'SELECT COALESCE(MAX(version_number), 0) + 1 as next_version FROM survey_versions WHERE survey_id = ?',
    //   [id]
    // );
    // const nextVersion = versionResult.rows[0].next_version;

    // await query(
    //   `INSERT INTO survey_versions (survey_id, version_number, title, description, theme, settings, questions_data, created_by)
    //    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    //   [
    //     id,
    //     nextVersion,
    //     surveyResult.rows[0].title,
    //     surveyResult.rows[0].description,
    //     surveyResult.rows[0].theme,
    //     surveyResult.rows[0].settings,
    //     JSON.stringify(questions || []),
    //     parseInt(req.user.id)
    //   ]
    // );

    // SQLite3 transactions are handled differently

    res.json(surveyResult.rows[0]);
  } catch (error) {
    // SQLite3 transactions are handled differently
    console.error('Error updating survey:', error);
    res.status(500).json({ error: 'Failed to update survey' });
  }
});

// DELETE /api/surveys/:id - Soft delete a survey
router.delete('/:id', auth, ensureIntegerUserId, async (req, res) => {
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
router.post('/:id/restore', auth, ensureIntegerUserId, async (req, res) => {
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
router.delete('/:id/permanent', auth, ensureIntegerUserId, async (req, res) => {
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
router.get('/:id/versions', auth, ensureIntegerUserId, async (req, res) => {
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

    // Get all versions (commented out - table doesn't exist)
    // const versionsResult = await query(
    //   'SELECT * FROM survey_versions WHERE survey_id = ? ORDER BY version_number DESC',
    //   [id]
    // );

    // res.json(versionsResult.rows);
    res.json([]); // Return empty array since versions table doesn't exist
  } catch (error) {
    console.error('Error fetching survey versions:', error);
    res.status(500).json({ error: 'Failed to fetch survey versions' });
  }
});

// POST /api/surveys/:id/restore-version/:version - Restore a specific version
router.post('/:id/restore-version/:version', auth, ensureIntegerUserId, async (req, res) => {
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

    // Get the specific version (commented out - table doesn't exist)
    // const versionResult = await query(
    //   'SELECT * FROM survey_versions WHERE survey_id = ? AND version_number = ?',
    //   [id, version]
    // );

    // if (versionResult.rows.length === 0) {
    //   return res.status(404).json({ error: 'Version not found' });
    // }

    // const versionData = versionResult.rows[0];
    
    // Since versions table doesn't exist, return error
    return res.status(501).json({ error: 'Version management not available - table missing' });

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
          `INSERT INTO questions (survey_id, question_type, question_text, options, required, order_index)
           VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          question.question_type,
          question.question_text,
          JSON.stringify(question.options || []),
            question.required || false,
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
router.post('/:id/publish', auth, ensureIntegerUserId, async (req, res) => {
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

    console.log('Survey published successfully - ID:', id, 'Status: published');

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
router.post('/:id/unpublish', auth, ensureIntegerUserId, async (req, res) => {
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

// Test route to check database schema and published surveys
router.get('/debug/published', auth, ensureIntegerUserId, async (req, res) => {
  try {
    console.log('Debug: Checking published surveys for user:', req.user.id);
    
    // Check if status column exists
    const schemaCheck = await query("PRAGMA table_info(surveys)");
    console.log('Survey table schema:', schemaCheck.rows);
    
    // Check all surveys for this user
    const allSurveys = await query(
      'SELECT id, title, status, user_id, is_deleted FROM surveys WHERE user_id = ?',
      [req.user.id]
    );
    console.log('All surveys for user:', allSurveys.rows);
    
    // Check published surveys specifically
    const publishedSurveys = await query(
      'SELECT id, title, status, user_id, is_deleted FROM surveys WHERE user_id = ? AND status = ? AND is_deleted = 0',
      [req.user.id, 'published']
    );
    console.log('Published surveys for user:', publishedSurveys.rows);
    
    res.json({
      schema: schemaCheck.rows,
      allSurveys: allSurveys.rows,
      publishedSurveys: publishedSurveys.rows
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: 'Debug failed' });
  }
});

// Test route to verify all question types work
router.post('/test-question-types', auth, ensureIntegerUserId, async (req, res) => {
  try {
    const userId = Math.floor(Number(req.user.id));
    
    // Create a test survey
    await query(
      `INSERT INTO surveys (title, description, user_id, theme, settings, questions_data)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Test Question Types', 'Testing all question types', userId, '{}', '{}', '[]']
    );
    
    const surveyResult = await query(
      'SELECT * FROM surveys WHERE id = last_insert_rowid()'
    );
    const survey = surveyResult.rows[0];
    
    // Test all question types
    const testQuestions = [
      { question_type: 'text', question_text: 'What is your name?', required: true },
      { question_type: 'textarea', question_text: 'Tell us about yourself', required: false },
      { question_type: 'radio', question_text: 'Choose your favorite color', options: [
        { value: 1, label: 'Red', text: 'Red' },
        { value: 2, label: 'Blue', text: 'Blue' },
        { value: 3, label: 'Green', text: 'Green' }
      ], required: true },
      { question_type: 'checkbox', question_text: 'Select your interests', options: [
        { value: 1, label: 'Sports', text: 'Sports' },
        { value: 2, label: 'Music', text: 'Music' },
        { value: 3, label: 'Reading', text: 'Reading' }
      ], required: false },
      { question_type: 'select', question_text: 'Choose your country', options: [
        { value: 1, label: 'USA', text: 'United States' },
        { value: 2, label: 'UK', text: 'United Kingdom' },
        { value: 3, label: 'CA', text: 'Canada' }
      ], required: true },
      { question_type: 'emoji', question_text: 'How do you feel today?', required: true },
      { question_type: 'rating', question_text: 'Rate our service', required: true },
      { question_type: 'scale', question_text: 'How much do you agree?', required: true },
      { question_type: 'date', question_text: 'When is your birthday?', required: false },
      { question_type: 'email', question_text: 'Enter your email', required: true },
      { question_type: 'number', question_text: 'How many siblings do you have?', required: false },
      { question_type: 'slider', question_text: 'Rate from 1-10', options: [
        { value: 1, label: '1', text: 'Poor' },
        { value: 10, label: '10', text: 'Excellent' }
      ], required: true }
    ];
    
    // Insert all test questions
    for (let i = 0; i < testQuestions.length; i++) {
      const question = testQuestions[i];
      const questionType = question.question_type;
      const questionText = question.question_text;
      const options = JSON.stringify(question.options || []);
      const required = question.required ? 1 : 0;
      const orderIndex = i;
      
      await query(
        `INSERT INTO questions (survey_id, question_type, question_text, options, required, order_index)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [survey.id, questionType, questionText, options, required, orderIndex]
      );
    }
    
    // Get the created questions
    const questionsResult = await query(
      'SELECT * FROM questions WHERE survey_id = ? ORDER BY order_index ASC',
      [survey.id]
    );
    
    res.status(201).json({
      message: 'Test survey created successfully with all question types',
      survey: {
        id: survey.id,
        title: survey.title,
        question_count: questionsResult.rows.length
      },
      questions: questionsResult.rows.map(q => ({
        id: q.id,
        type: q.question_type,
        text: q.question_text,
        required: q.required,
        options: JSON.parse(q.options || '[]')
      }))
    });
    
  } catch (error) {
    console.error('Error creating test survey:', error);
    res.status(500).json({ error: 'Failed to create test survey', details: error.message });
  }
});

// POST /api/surveys/:id/copy - Duplicate a survey
router.post('/:id/copy', auth, ensureIntegerUserId, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if survey belongs to user and is not deleted
    const surveyCheck = await query(
      'SELECT * FROM surveys WHERE id = ? AND user_id = ? AND is_deleted = 0',
      [id, req.user.id]
    );

    if (surveyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const originalSurvey = surveyCheck.rows[0];

    // Create a copy of the survey
    const copyResult = await query(
      `INSERT INTO surveys (title, description, user_id, theme, settings, status, questions_data)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `${originalSurvey.title} (Copy)`,
        originalSurvey.description,
        req.user.id,
        originalSurvey.theme,
        originalSurvey.settings,
        'draft',
        originalSurvey.questions_data
      ]
    );

    const newSurveyId = copyResult.lastInsertRowid;

    // Copy all questions from the original survey
    const questionsResult = await query(
      'SELECT * FROM questions WHERE survey_id = ? AND is_deleted = 0 ORDER BY order_index ASC',
      [id]
    );

    for (const question of questionsResult.rows) {
      await query(
        `INSERT INTO questions (survey_id, question_type, question_text, options, required, order_index)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          newSurveyId,
          question.question_type,
          question.question_text,
          question.options,
          question.required,
          question.order_index
        ]
      );
    }

    // Get the copied survey
    const newSurveyResult = await query(
      'SELECT * FROM surveys WHERE id = ?',
      [newSurveyId]
    );

    res.status(201).json({
      message: 'Survey copied successfully',
      survey: newSurveyResult.rows[0]
    });
  } catch (error) {
    console.error('Error copying survey:', error);
    res.status(500).json({ error: 'Failed to copy survey' });
  }
});

// PATCH /api/surveys/:id - Update survey status (archive, etc.)
router.patch('/:id', auth, ensureIntegerUserId, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if survey belongs to user and is not deleted
    const surveyCheck = await query(
      'SELECT id, status FROM surveys WHERE id = ? AND user_id = ? AND is_deleted = 0',
      [id, req.user.id]
    );

    if (surveyCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const survey = surveyCheck.rows[0];

    // Validate status change
    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update the survey status
    await query(
      'UPDATE surveys SET status = ?, updated_at = datetime(\'now\') WHERE id = ?',
      [status, id]
    );

    res.json({ 
      message: 'Survey status updated successfully',
      survey: { id, status }
    });
  } catch (error) {
    console.error('Error updating survey status:', error);
    res.status(500).json({ error: 'Failed to update survey status' });
  }
});

module.exports = router; 