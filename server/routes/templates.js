const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { query } = require('../database/connection');

// Helper function to transform template data for frontend
const transformTemplateForFrontend = (template) => {
  try {
    // Handle both string and object template_data
    const templateData = typeof template.template_data === 'string' 
      ? JSON.parse(template.template_data) 
      : template.template_data;
    
    // Generate a frontend-friendly ID based on category or name
    const generateFrontendId = (category, name) => {
      if (category) {
        return category.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      }
      if (name) {
        return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      }
      return `template_${template.id}`;
    };
    
    const frontendId = generateFrontendId(templateData.category || template.category, templateData.title || template.name);
    
    // Transform questions to match frontend expectations
    const transformQuestions = (questions) => {
      if (!Array.isArray(questions)) return [];
      
      return questions.map((q, index) => ({
        id: index + 1,
        text: q.title || q.text || '',
        type: q.type || 'text',
        required: q.required || false,
        options: q.options || [],
        order_index: index + 1,
        settings: q.settings || {}
      }));
    };
    
    return {
      id: frontendId, // Use frontend-friendly ID
      databaseId: template.id, // Keep original database ID
      title: templateData.title || template.name,
      description: templateData.description || template.description,
      questions: transformQuestions(templateData.questions || []),
      category: templateData.category || template.category,
      is_public: template.is_public,
      type: template.type || 'system',
      created_at: template.created_at,
      updated_at: template.updated_at
    };
  } catch (error) {
    console.error('Error parsing template data:', error);
    
    const generateFrontendId = (category, name) => {
      if (category) {
        return category.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      }
      if (name) {
        return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      }
      return `template_${template.id}`;
    };
    
    const frontendId = generateFrontendId(template.category, template.name);
    
    return {
      id: frontendId, // Use frontend-friendly ID
      databaseId: template.id, // Keep original database ID
      title: template.name,
      description: template.description,
      questions: [],
      category: template.category,
      is_public: template.is_public,
      type: template.type || 'system',
      created_at: template.created_at,
      updated_at: template.updated_at
    };
  }
};

// POST /api/templates - Create a new template
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, questions, category, is_public = false } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Template title is required' });
    }
    
    // Create template_data structure
    const template_data = {
      title: title,
      description: description || '',
      category: category || 'Custom',
      questions: questions || []
    };
    
    // Insert template into database
    const result = await query(
      `INSERT INTO custom_templates (name, description, category, template_data, is_public, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
      title,
        description || '',
        category || 'Custom',
        JSON.stringify(template_data),
        is_public,
        req.user.id
      ]
    );
    
    const transformedTemplate = transformTemplateForFrontend({ ...result.rows[0], type: 'custom' });
    
    res.status(201).json({
      message: 'Template created successfully',
      template: transformedTemplate
    });
    
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// GET /api/templates - Get all available templates
router.get('/', auth, async (req, res) => {
  try {
    // Get system templates (not deleted)
    const systemTemplatesResult = await query(
      `SELECT id, name, description, category, template_data, is_public, created_at, updated_at
       FROM survey_templates 
       WHERE is_deleted = 0
       ORDER BY name ASC`
    );

    // Get custom templates (not deleted, created by user or public)
    const customTemplatesResult = await query(
      `SELECT id, name, description, category, template_data, is_public, created_by, created_at, updated_at
       FROM custom_templates 
       WHERE is_deleted = 0 AND (created_by = ? OR is_public = 1)
       ORDER BY name ASC`,
      [req.user.id]
    );

    // Transform templates for frontend
    const systemTemplates = systemTemplatesResult.rows.map(t => transformTemplateForFrontend({ ...t, type: 'system' }));
    const customTemplates = customTemplatesResult.rows.map(t => transformTemplateForFrontend({ ...t, type: 'custom' }));

    const templates = [...systemTemplates, ...customTemplates];
    
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// GET /api/templates/system - Get only system templates
router.get('/system', auth, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, description, category, template_data, is_public, created_at, updated_at
       FROM survey_templates 
       WHERE is_deleted = 0
       ORDER BY name ASC`
    );
    
    const templates = result.rows.map(t => transformTemplateForFrontend({ ...t, type: 'system' }));
    res.json(templates);
  } catch (error) {
    console.error('Error fetching system templates:', error);
    res.status(500).json({ error: 'Failed to fetch system templates' });
  }
});

// GET /api/templates/custom - Get only custom templates
router.get('/custom', auth, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, description, category, template_data, is_public, created_by, created_at, updated_at
       FROM custom_templates 
       WHERE is_deleted = 0 AND (created_by = ? OR is_public = 1)
       ORDER BY name ASC`,
      [req.user.id]
    );
    
    const templates = result.rows.map(t => transformTemplateForFrontend({ ...t, type: 'custom' }));
    res.json(templates);
  } catch (error) {
    console.error('Error fetching custom templates:', error);
    res.status(500).json({ error: 'Failed to fetch custom templates' });
  }
});

// GET /api/templates/:id - Get a specific template
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find in system templates first
    let result = await query(
      `SELECT id, name, description, category, template_data, is_public, created_at, updated_at
       FROM survey_templates 
       WHERE id = ? AND is_deleted = 0`,
      [id]
    );

    if (result.rows.length > 0) {
      const template = transformTemplateForFrontend({ ...result.rows[0], type: 'system' });
      return res.json(template);
    }

    // Try to find in custom templates
    result = await query(
      `SELECT id, name, description, category, template_data, is_public, created_by, created_at, updated_at
       FROM custom_templates 
       WHERE id = ? AND is_deleted = 0 AND (created_by = ? OR is_public = 1)`,
      [id, req.user.id]
    );

    if (result.rows.length > 0) {
      const template = transformTemplateForFrontend({ ...result.rows[0], type: 'custom' });
      return res.json(template);
    }
    
    res.status(404).json({ error: 'Template not found' });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// POST /api/templates/:id/create - Create a survey from template
router.post('/:id/create', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    
    let template = null;
    let templateType = 'system';

    // Check if ID is numeric (database ID) or string (frontend ID)
    if (!isNaN(id) && !id.includes('_')) {
      // Numeric ID - try database lookup first
      // Try system templates first
      let templateResult = await query(
        `SELECT * FROM survey_templates WHERE id = $1 AND is_deleted = false`,
        [parseInt(id)]
      );

      if (templateResult.rows.length > 0) {
        template = templateResult.rows[0];
      } else {
        // Try custom templates
        templateResult = await query(
          `SELECT * FROM custom_templates WHERE id = $1 AND is_deleted = false AND (created_by = $2 OR is_public = true)`,
          [parseInt(id), req.user.id]
        );
        
        if (templateResult.rows.length > 0) {
          template = templateResult.rows[0];
          templateType = 'custom';
        }
      }
    } else {
      // String ID - search by frontend ID (category-based)
      // Convert frontend ID to search term (e.g. "customer_feedback" -> "customer feedback")
      const searchTerm = id.replace(/_/g, ' ');
      
      // Search in system templates by category
      let templateResult = await query(
        `SELECT * FROM survey_templates WHERE LOWER(category) LIKE LOWER(?) AND is_deleted = 0`,
        [`%${searchTerm}%`]
      );
      
      if (templateResult.rows.length > 0) {
        template = templateResult.rows[0];
      } else {
        // Search in custom templates by category
        templateResult = await query(
          `SELECT * FROM custom_templates WHERE LOWER(category) LIKE LOWER(?) AND is_deleted = 0 AND (created_by = ? OR is_public = 1)`,
          [`%${searchTerm}%`, req.user.id]
        );
        
        if (templateResult.rows.length > 0) {
          template = templateResult.rows[0];
          templateType = 'custom';
        }
      }
    }

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Parse template data
    let templateData;
    try {
      templateData = typeof template.template_data === 'string' 
        ? JSON.parse(template.template_data) 
        : template.template_data;
    } catch (error) {
      console.error('Error parsing template data:', error);
      return res.status(500).json({ error: 'Invalid template data' });
    }
    
    // Start a transaction
    await query('BEGIN');
    
    // Create the survey
    const surveyResult = await query(
      `INSERT INTO surveys (user_id, title, description, status, theme, settings)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        req.user.id,
        title || templateData.title || template.name,
        description || templateData.description || template.description,
        'draft',
        JSON.stringify(templateData.theme || { primaryColor: '#3B82F6', secondaryColor: '#1E40AF' }),
        JSON.stringify(templateData.settings || { allowAnonymous: true, showProgress: true })
      ]
    );
    
    const surveyId = surveyResult.rows[0].id;
    
    // Create questions from template
    const questions = templateData.questions || [];
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      await query(
        `INSERT INTO questions (survey_id, title, type, required, options, order_index, settings)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          surveyId,
          question.text || question.title,
          question.type,
          question.required || false,
          JSON.stringify(question.options || []),
          i + 1,
          JSON.stringify(question.settings || {})
        ]
      );
    }

    // Create initial version
    await query(
      `INSERT INTO survey_versions (survey_id, version_number, title, description, theme, settings, questions_data, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
      surveyId,
        1,
        title || templateData.title || template.name,
        description || templateData.description || template.description,
        JSON.stringify(templateData.theme || {}),
        JSON.stringify(templateData.settings || {}),
        JSON.stringify(questions),
        req.user.id
      ]
    );

    await query('COMMIT');
    
    res.status(201).json({
      message: 'Survey created successfully from template',
      surveyId: surveyId,
      survey: {
        id: surveyId,
        title: title || templateData.title || template.name,
        description: description || templateData.description || template.description,
        status: 'draft'
      }
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error creating survey from template:', error);
    res.status(500).json({ error: 'Failed to create survey from template' });
  }
});

// POST /api/templates/:id/customize - Create a survey from customized template
router.post('/:id/customize', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, questions } = req.body;
    
    let template = null;
    let templateType = 'system';

    // Check if ID is numeric (database ID) or string (frontend ID)
    if (!isNaN(id) && !id.includes('_')) {
      // Numeric ID - try database lookup first
      // Try system templates first
      let templateResult = await query(
        `SELECT * FROM survey_templates WHERE id = $1 AND is_deleted = false`,
        [parseInt(id)]
      );

      if (templateResult.rows.length > 0) {
        template = templateResult.rows[0];
      } else {
        // Try custom templates
        templateResult = await query(
          `SELECT * FROM custom_templates WHERE id = $1 AND is_deleted = false AND (created_by = $2 OR is_public = true)`,
          [parseInt(id), req.user.id]
        );
        
        if (templateResult.rows.length > 0) {
          template = templateResult.rows[0];
          templateType = 'custom';
        }
      }
    } else {
      // String ID - search by frontend ID (category-based)
      // Convert frontend ID to search term (e.g. "customer_feedback" -> "customer feedback")
      const searchTerm = id.replace(/_/g, ' ');
      
      // Search in system templates by category
      let templateResult = await query(
        `SELECT * FROM survey_templates WHERE LOWER(category) LIKE LOWER(?) AND is_deleted = 0`,
        [`%${searchTerm}%`]
      );
      
      if (templateResult.rows.length > 0) {
        template = templateResult.rows[0];
      } else {
        // Search in custom templates by category
        templateResult = await query(
          `SELECT * FROM custom_templates WHERE LOWER(category) LIKE LOWER(?) AND is_deleted = 0 AND (created_by = ? OR is_public = 1)`,
          [`%${searchTerm}%`, req.user.id]
        );
        
        if (templateResult.rows.length > 0) {
          template = templateResult.rows[0];
          templateType = 'custom';
        }
      }
    }

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Start a transaction
    await query('BEGIN');
    
    // Create the survey from customized data
    const surveyResult = await query(
      `INSERT INTO surveys (user_id, title, description, status, theme, settings)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        req.user.id,
        title || template.name,
        description || template.description,
        'draft',
        JSON.stringify({ primaryColor: '#3B82F6', secondaryColor: '#1E40AF' }),
        JSON.stringify({ allowAnonymous: true, showProgress: true })
      ]
    );
    
    const surveyId = surveyResult.rows[0].id;
    
    // Create questions from customized questions
    const questionsToCreate = questions || [];
    for (let i = 0; i < questionsToCreate.length; i++) {
      const question = questionsToCreate[i];
      await query(
        `INSERT INTO questions (survey_id, title, type, required, options, order_index, settings)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          surveyId,
          question.text || question.title,
          question.type,
          question.required || false,
          JSON.stringify(question.options || []),
          i + 1,
          JSON.stringify(question.settings || {})
        ]
      );
    }

    // Create initial version
    await query(
      `INSERT INTO survey_versions (survey_id, version_number, title, description, theme, settings, questions_data, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
      surveyId,
        1,
        title || template.name,
        description || template.description,
        JSON.stringify({ primaryColor: '#3B82F6', secondaryColor: '#1E40AF' }),
        JSON.stringify({ allowAnonymous: true, showProgress: true }),
        JSON.stringify(questionsToCreate),
        req.user.id
      ]
    );

    await query('COMMIT');
    
    res.status(201).json({
      message: 'Survey created successfully from customized template',
      surveyId: surveyId,
      survey: {
        id: surveyId,
        title: title || template.name,
        description: description || template.description,
        status: 'draft'
      }
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error creating survey from customized template:', error);
    res.status(500).json({ error: 'Failed to create survey from customized template' });
  }
});

// PUT /api/templates/:id - Update a custom template
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, questions } = req.body;

    // Validate required fields
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Template name is required' });
    }

    // Check if template exists and belongs to user
    const templateCheck = await query(
      'SELECT id FROM custom_templates WHERE id = $1 AND created_by = $2 AND is_deleted = false',
      [id, req.user.id]
    );

    if (templateCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Update template
    const result = await query(
      `UPDATE custom_templates 
       SET name = ?, description = ?, category = ?, template_data = ?, updated_at = datetime('now')
                WHERE id = ?
       RETURNING *`,
      [
        title.trim(),
        description || '',
        category || 'Custom',
        JSON.stringify({
          title: title.trim(),
          description: description || '',
          category: category || 'Custom',
          questions: questions || []
        }),
        id
      ]
    );

    const transformedTemplate = transformTemplateForFrontend({ ...result.rows[0], type: 'custom' });
    
    res.json({
      message: 'Template updated successfully',
      template: transformedTemplate
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// POST /api/templates/:id/duplicate - Duplicate a template
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    let template = null;
    let templateType = 'system';

    // Check if ID is numeric (database ID) or string (frontend ID)
    if (!isNaN(id) && !id.includes('_')) {
      // Numeric ID - try database lookup first
      // Try system templates first
      let templateResult = await query(
        `SELECT * FROM survey_templates WHERE id = $1 AND is_deleted = false`,
        [parseInt(id)]
      );

      if (templateResult.rows.length > 0) {
        template = templateResult.rows[0];
      } else {
        // Try custom templates
        templateResult = await query(
          `SELECT * FROM custom_templates WHERE id = $1 AND is_deleted = false AND (created_by = $2 OR is_public = true)`,
          [parseInt(id), req.user.id]
        );
        
        if (templateResult.rows.length > 0) {
          template = templateResult.rows[0];
          templateType = 'custom';
        }
      }
    } else {
      // String ID - search by frontend ID (category-based)
      // Convert frontend ID to search term (e.g. "customer_feedback" -> "customer feedback")
      const searchTerm = id.replace(/_/g, ' ');
      
      // Search in system templates by category
      let templateResult = await query(
        `SELECT * FROM survey_templates WHERE LOWER(category) LIKE LOWER(?) AND is_deleted = 0`,
        [`%${searchTerm}%`]
      );
      
      if (templateResult.rows.length > 0) {
        template = templateResult.rows[0];
      } else {
        // Search in custom templates by category
        templateResult = await query(
          `SELECT * FROM custom_templates WHERE LOWER(category) LIKE LOWER(?) AND is_deleted = 0 AND (created_by = ? OR is_public = 1)`,
          [`%${searchTerm}%`, req.user.id]
        );
        
        if (templateResult.rows.length > 0) {
          template = templateResult.rows[0];
          templateType = 'custom';
        }
      }
    }

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Create duplicate as custom template
    const result = await query(
      `INSERT INTO custom_templates (name, description, category, template_data, is_public, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        name || `${template.name} (Copy)`,
        description || template.description,
        template.category,
        template.template_data,
        false, // Always private when duplicated
        req.user.id
      ]
    );
    
    const transformedTemplate = transformTemplateForFrontend({ ...result.rows[0], type: 'custom' });
    
    res.json({
      message: 'Template duplicated successfully',
      template: transformedTemplate
    });
  } catch (error) {
    console.error('Error duplicating template:', error);
    res.status(500).json({ error: 'Failed to duplicate template' });
  }
});

// DELETE /api/templates/:id - Soft delete a template (custom templates only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if template exists and belongs to user
    const templateCheck = await query(
      `SELECT id FROM custom_templates 
       WHERE id = $1 AND created_by = $2 AND is_deleted = false`,
      [id, req.user.id]
    );
    
    if (templateCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found or access denied' });
    }
    
    // Soft delete template
    await query(
      `UPDATE custom_templates 
       SET is_deleted = 1, deleted_at = datetime('now'), deleted_by = ?
       WHERE id = ?`,
      [req.user.id, id]
    );
    
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// POST /api/templates/:id/restore - Restore a soft deleted template
router.post('/:id/restore', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if template exists and belongs to user
    const templateCheck = await query(
      `SELECT id FROM custom_templates 
       WHERE id = $1 AND created_by = $2 AND is_deleted = true`,
      [id, req.user.id]
    );
    
    if (templateCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Deleted template not found or access denied' });
    }
    
    // Restore template
    await query(
      `UPDATE custom_templates 
       SET is_deleted = false, deleted_at = NULL, deleted_by = NULL
       WHERE id = $1`,
      [id]
    );
    
    res.json({ message: 'Template restored successfully' });
  } catch (error) {
    console.error('Error restoring template:', error);
    res.status(500).json({ error: 'Failed to restore template' });
  }
});

// GET /api/templates/deleted - Get soft deleted templates
router.get('/deleted', auth, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, description, category, template_data, is_public, created_by, created_at, updated_at, deleted_at
       FROM custom_templates 
       WHERE is_deleted = true AND created_by = $1
       ORDER BY deleted_at DESC`,
      [req.user.id]
    );
    
    const templates = result.rows.map(t => transformTemplateForFrontend({ ...t, type: 'custom' }));
    res.json(templates);
  } catch (error) {
    console.error('Error fetching deleted templates:', error);
    res.status(500).json({ error: 'Failed to fetch deleted templates' });
  }
});

module.exports = router;
