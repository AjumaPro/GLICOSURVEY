const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');
const auth = require('../middleware/auth');
const ensureIntegerUserId = require('../middleware/auth').ensureIntegerUserId || ((req, res, next) => {
  if (req.user && req.user.id) {
    req.user.id = Math.floor(Number(req.user.id));
    if (isNaN(req.user.id) || req.user.id <= 0) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
  }
  next();
});

// GET /api/themes - Get all themes for a user
router.get('/', auth, ensureIntegerUserId, async (req, res) => {
  try {
    const { category, search, sort = 'created_at', order = 'DESC', limit = 20, offset = 0 } = req.query;
    
    let whereConditions = ['user_id = ?'];
    let params = [req.user.id];
    
    if (category && category !== 'all') {
      whereConditions.push('category = ?');
      params.push(category);
    }
    
    if (search) {
      whereConditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    const validSortFields = ['name', 'created_at', 'updated_at', 'usage_count', 'rating'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    const sql = `
      SELECT t.*, 
             COUNT(s.id) as usage_count,
             AVG(COALESCE(tr.rating, 0)) as rating
      FROM themes t
      LEFT JOIN surveys s ON s.theme_id = t.id
      LEFT JOIN theme_ratings tr ON tr.theme_id = t.id
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY t.id
      ORDER BY ${sortField} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await query(sql, params);
    
    // Format theme data
    const themes = result.rows.map(theme => ({
      ...theme,
      colors: typeof theme.colors === 'string' ? JSON.parse(theme.colors) : theme.colors,
      typography: typeof theme.typography === 'string' ? JSON.parse(theme.typography) : theme.typography,
      layout: typeof theme.layout === 'string' ? JSON.parse(theme.layout) : theme.layout,
      components: typeof theme.components === 'string' ? JSON.parse(theme.components) : theme.components,
      usage_count: parseInt(theme.usage_count) || 0,
      rating: parseFloat(theme.rating) || 0
    }));
    
    res.json(themes);
  } catch (error) {
    console.error('Error fetching themes:', error);
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
});

// GET /api/themes/:id - Get a specific theme
router.get('/:id', auth, ensureIntegerUserId, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'SELECT * FROM themes WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Theme not found' });
    }
    
    const theme = result.rows[0];
    
    // Parse JSON fields
    theme.colors = typeof theme.colors === 'string' ? JSON.parse(theme.colors) : theme.colors;
    theme.typography = typeof theme.typography === 'string' ? JSON.parse(theme.typography) : theme.typography;
    theme.layout = typeof theme.layout === 'string' ? JSON.parse(theme.layout) : theme.layout;
    theme.components = typeof theme.components === 'string' ? JSON.parse(theme.components) : theme.components;
    
    res.json(theme);
  } catch (error) {
    console.error('Error fetching theme:', error);
    res.status(500).json({ error: 'Failed to fetch theme' });
  }
});

// POST /api/themes - Create a new theme
router.post('/', auth, ensureIntegerUserId, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      colors,
      typography,
      layout,
      components,
      is_default = false,
      is_premium = false
    } = req.body;
    
    // Validate required fields
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }
    
    // Validate theme data structure
    if (!colors || !typography || !layout || !components) {
      return res.status(400).json({ error: 'Invalid theme data structure' });
    }
    
    const result = await query(
      `INSERT INTO themes (user_id, name, description, category, colors, typography, layout, components, is_default, is_premium, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        req.user.id,
        name,
        description || '',
        category,
        JSON.stringify(colors),
        JSON.stringify(typography),
        JSON.stringify(layout),
        JSON.stringify(components),
        is_default ? 1 : 0,
        is_premium ? 1 : 0
      ]
    );
    
    const themeId = result.lastID;
    
    // Get the created theme
    const themeResult = await query(
      'SELECT * FROM themes WHERE id = ?',
      [themeId]
    );
    
    const theme = themeResult.rows[0];
    theme.colors = JSON.parse(theme.colors);
    theme.typography = JSON.parse(theme.typography);
    theme.layout = JSON.parse(theme.layout);
    theme.components = JSON.parse(theme.components);
    
    res.status(201).json(theme);
  } catch (error) {
    console.error('Error creating theme:', error);
    res.status(500).json({ error: 'Failed to create theme' });
  }
});

// PUT /api/themes/:id - Update a theme
router.put('/:id', auth, ensureIntegerUserId, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      colors,
      typography,
      layout,
      components,
      is_default,
      is_premium
    } = req.body;
    
    // Check if theme exists and belongs to user
    const existingTheme = await query(
      'SELECT id FROM themes WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    
    if (existingTheme.rows.length === 0) {
      return res.status(404).json({ error: 'Theme not found' });
    }
    
    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    
    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (category !== undefined) {
      updateFields.push('category = ?');
      updateValues.push(category);
    }
    if (colors !== undefined) {
      updateFields.push('colors = ?');
      updateValues.push(JSON.stringify(colors));
    }
    if (typography !== undefined) {
      updateFields.push('typography = ?');
      updateValues.push(JSON.stringify(typography));
    }
    if (layout !== undefined) {
      updateFields.push('layout = ?');
      updateValues.push(JSON.stringify(layout));
    }
    if (components !== undefined) {
      updateFields.push('components = ?');
      updateValues.push(JSON.stringify(components));
    }
    if (is_default !== undefined) {
      updateFields.push('is_default = ?');
      updateValues.push(is_default ? 1 : 0);
    }
    if (is_premium !== undefined) {
      updateFields.push('is_premium = ?');
      updateValues.push(is_premium ? 1 : 0);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updateFields.push('updated_at = datetime(\'now\')');
    updateValues.push(id);
    
    await query(
      `UPDATE themes SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    // Get the updated theme
    const themeResult = await query(
      'SELECT * FROM themes WHERE id = ?',
      [id]
    );
    
    const theme = themeResult.rows[0];
    theme.colors = JSON.parse(theme.colors);
    theme.typography = JSON.parse(theme.typography);
    theme.layout = JSON.parse(theme.layout);
    theme.components = JSON.parse(theme.components);
    
    res.json(theme);
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({ error: 'Failed to update theme' });
  }
});

// DELETE /api/themes/:id - Delete a theme
router.delete('/:id', auth, ensureIntegerUserId, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if theme exists and belongs to user
    const existingTheme = await query(
      'SELECT id, is_default FROM themes WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    
    if (existingTheme.rows.length === 0) {
      return res.status(404).json({ error: 'Theme not found' });
    }
    
    // Prevent deletion of default theme
    if (existingTheme.rows[0].is_default) {
      return res.status(400).json({ error: 'Cannot delete default theme' });
    }
    
    // Check if theme is being used by any surveys
    const usageCheck = await query(
      'SELECT COUNT(*) as count FROM surveys WHERE theme_id = ?',
      [id]
    );
    
    if (usageCheck.rows[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete theme that is being used by surveys',
        usage_count: usageCheck.rows[0].count
      });
    }
    
    await query('DELETE FROM themes WHERE id = ?', [id]);
    
    res.json({ message: 'Theme deleted successfully' });
  } catch (error) {
    console.error('Error deleting theme:', error);
    res.status(500).json({ error: 'Failed to delete theme' });
  }
});

// POST /api/themes/:id/duplicate - Duplicate a theme
router.post('/:id/duplicate', auth, ensureIntegerUserId, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    // Get the original theme
    const originalTheme = await query(
      'SELECT * FROM themes WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    
    if (originalTheme.rows.length === 0) {
      return res.status(404).json({ error: 'Theme not found' });
    }
    
    const theme = originalTheme.rows[0];
    const newName = name || `${theme.name} (Copy)`;
    
    // Create duplicate
    const result = await query(
      `INSERT INTO themes (user_id, name, description, category, colors, typography, layout, components, is_default, is_premium, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, datetime('now'), datetime('now'))`,
      [
        req.user.id,
        newName,
        theme.description,
        theme.category,
        theme.colors,
        theme.typography,
        theme.layout,
        theme.components
      ]
    );
    
    const newThemeId = result.lastID;
    
    // Get the new theme
    const newThemeResult = await query(
      'SELECT * FROM themes WHERE id = ?',
      [newThemeId]
    );
    
    const newTheme = newThemeResult.rows[0];
    newTheme.colors = JSON.parse(newTheme.colors);
    newTheme.typography = JSON.parse(newTheme.typography);
    newTheme.layout = JSON.parse(newTheme.layout);
    newTheme.components = JSON.parse(newTheme.components);
    
    res.status(201).json(newTheme);
  } catch (error) {
    console.error('Error duplicating theme:', error);
    res.status(500).json({ error: 'Failed to duplicate theme' });
  }
});

// GET /api/themes/:id/preview - Get theme preview
router.get('/:id/preview', auth, ensureIntegerUserId, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'SELECT * FROM themes WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Theme not found' });
    }
    
    const theme = result.rows[0];
    theme.colors = JSON.parse(theme.colors);
    theme.typography = JSON.parse(theme.typography);
    theme.layout = JSON.parse(theme.layout);
    theme.components = JSON.parse(theme.components);
    
    res.json(theme);
  } catch (error) {
    console.error('Error fetching theme preview:', error);
    res.status(500).json({ error: 'Failed to fetch theme preview' });
  }
});

// GET /api/themes/:id/export - Export theme
router.get('/:id/export', auth, ensureIntegerUserId, async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'json' } = req.query;
    
    const result = await query(
      'SELECT * FROM themes WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Theme not found' });
    }
    
    const theme = result.rows[0];
    theme.colors = JSON.parse(theme.colors);
    theme.typography = JSON.parse(theme.typography);
    theme.layout = JSON.parse(theme.layout);
    theme.components = JSON.parse(theme.components);
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${theme.name.replace(/\s+/g, '-').toLowerCase()}.json"`);
      res.json(theme);
    } else {
      res.status(400).json({ error: 'Unsupported export format' });
    }
  } catch (error) {
    console.error('Error exporting theme:', error);
    res.status(500).json({ error: 'Failed to export theme' });
  }
});

// POST /api/themes/import - Import theme
router.post('/import', auth, ensureIntegerUserId, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      colors,
      typography,
      layout,
      components
    } = req.body;
    
    // Validate required fields
    if (!name || !category || !colors || !typography || !layout || !components) {
      return res.status(400).json({ error: 'Invalid theme data' });
    }
    
    const result = await query(
      `INSERT INTO themes (user_id, name, description, category, colors, typography, layout, components, is_default, is_premium, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, datetime('now'), datetime('now'))`,
      [
        req.user.id,
        name,
        description || '',
        category,
        JSON.stringify(colors),
        JSON.stringify(typography),
        JSON.stringify(layout),
        JSON.stringify(components)
      ]
    );
    
    const themeId = result.lastID;
    
    // Get the imported theme
    const themeResult = await query(
      'SELECT * FROM themes WHERE id = ?',
      [themeId]
    );
    
    const theme = themeResult.rows[0];
    theme.colors = JSON.parse(theme.colors);
    theme.typography = JSON.parse(theme.typography);
    theme.layout = JSON.parse(theme.layout);
    theme.components = JSON.parse(theme.components);
    
    res.status(201).json(theme);
  } catch (error) {
    console.error('Error importing theme:', error);
    res.status(500).json({ error: 'Failed to import theme' });
  }
});

// GET /api/themes/categories - Get theme categories
router.get('/categories', auth, ensureIntegerUserId, async (req, res) => {
  try {
    const categories = [
      { value: 'professional', label: 'Professional', icon: '💼' },
      { value: 'friendly', label: 'Friendly', icon: '😊' },
      { value: 'elegant', label: 'Elegant', icon: '✨' },
      { value: 'minimal', label: 'Minimal', icon: '📐' },
      { value: 'vibrant', label: 'Vibrant', icon: '🎨' },
      { value: 'corporate', label: 'Corporate', icon: '🏢' },
      { value: 'creative', label: 'Creative', icon: '🎭' },
      { value: 'modern', label: 'Modern', icon: '🚀' }
    ];
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching theme categories:', error);
    res.status(500).json({ error: 'Failed to fetch theme categories' });
  }
});

// POST /api/themes/:id/rate - Rate a theme
router.post('/:id/rate', auth, ensureIntegerUserId, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Check if theme exists
    const themeCheck = await query(
      'SELECT id FROM themes WHERE id = ?',
      [id]
    );
    
    if (themeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Theme not found' });
    }
    
    // Insert or update rating
    await query(
      `INSERT INTO theme_ratings (theme_id, user_id, rating, created_at, updated_at)
       VALUES (?, ?, ?, datetime('now'), datetime('now'))
       ON CONFLICT(theme_id, user_id) DO UPDATE SET
       rating = excluded.rating,
       updated_at = datetime('now')`,
      [id, req.user.id, rating]
    );
    
    res.json({ message: 'Theme rated successfully' });
  } catch (error) {
    console.error('Error rating theme:', error);
    res.status(500).json({ error: 'Failed to rate theme' });
  }
});

module.exports = router;
