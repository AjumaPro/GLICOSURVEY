const express = require('express');
const { query } = require('../database/connection');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all tasks (with filtering and pagination)
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      assigned_to,
      search = '',
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const validSortFields = ['title', 'status', 'priority', 'due_date', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];

    if (!validSortFields.includes(sort_by)) {
      sort_by = 'created_at';
    }
    if (!validSortOrders.includes(sort_order.toUpperCase())) {
      sort_order = 'DESC';
    }

    let whereConditions = ['t.created_by = $1 OR t.assigned_to = $1'];
    let params = [req.user.id];
    let paramIndex = 2;

    if (status) {
      whereConditions.push(`t.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (priority) {
      whereConditions.push(`t.priority = $${paramIndex}`);
      params.push(priority);
      paramIndex++;
    }

    if (assigned_to) {
      whereConditions.push(`t.assigned_to = $${paramIndex}`);
      params.push(assigned_to);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get tasks with pagination
    const tasksResult = await query(
      `SELECT 
        t.id, t.title, t.description, t.status, t.priority, t.due_date,
        t.tags, t.attachments, t.created_at, t.updated_at,
        u1.username as created_by_username, u1.full_name as created_by_full_name,
        u2.username as assigned_to_username, u2.full_name as assigned_to_full_name
       FROM tasks t
       LEFT JOIN users u1 ON t.created_by = u1.id
       LEFT JOIN users u2 ON t.assigned_to = u2.id
       WHERE ${whereClause}
       ORDER BY t.${sort_by} ${sort_order}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM tasks t
       WHERE ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        tasks: tasksResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      }
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get task by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        t.id, t.title, t.description, t.status, t.priority, t.due_date,
        t.tags, t.attachments, t.created_at, t.updated_at,
        u1.username as created_by_username, u1.full_name as created_by_full_name,
        u2.username as assigned_to_username, u2.full_name as assigned_to_full_name
       FROM tasks t
       LEFT JOIN users u1 ON t.created_by = u1.id
       LEFT JOIN users u2 ON t.assigned_to = u2.id
       WHERE t.id = $1 AND (t.created_by = $2 OR t.assigned_to = $2)`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create new task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, status, priority, due_date, assigned_to, tags } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    const result = await query(
      `INSERT INTO tasks (title, description, status, priority, due_date, assigned_to, tags, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, title, description, status, priority, due_date, tags, created_at`,
      [
        title,
        description || null,
        status || 'pending',
        priority || 'medium',
        due_date || null,
        assigned_to || null,
        tags || [],
        req.user.id
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_date, assigned_to, tags, attachments } = req.body;

    // Check if user can update this task
    const taskCheck = await query(
      'SELECT created_by, assigned_to FROM tasks WHERE id = $1',
      [id]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const task = taskCheck.rows[0];
    if (task.created_by !== req.user.id && task.assigned_to !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const result = await query(
      `UPDATE tasks 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           due_date = COALESCE($5, due_date),
           assigned_to = COALESCE($6, assigned_to),
           tags = COALESCE($7, tags),
           attachments = COALESCE($8, attachments),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING id, title, description, status, priority, due_date, tags, attachments, updated_at`,
      [title, description, status, priority, due_date, assigned_to, tags, attachments, id]
    );

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Only creator can delete the task
    const taskCheck = await query(
      'SELECT created_by FROM tasks WHERE id = $1',
      [id]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    if (taskCheck.rows[0].created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only the creator can delete this task'
      });
    }

    await query('DELETE FROM tasks WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get task statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN due_date < CURRENT_TIMESTAMP AND status != 'completed' THEN 1 END) as overdue_tasks,
        COUNT(CASE WHEN created_by = $1 THEN 1 END) as my_created_tasks,
        COUNT(CASE WHEN assigned_to = $1 THEN 1 END) as my_assigned_tasks
      FROM tasks
      WHERE created_by = $1 OR assigned_to = $1
    `, [req.user.id]);

    const priorityStatsResult = await query(`
      SELECT priority, COUNT(*) as count
      FROM tasks
      WHERE (created_by = $1 OR assigned_to = $1) AND status != 'completed'
      GROUP BY priority
      ORDER BY count DESC
    `, [req.user.id]);

    const monthlyStatsResult = await query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as created_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks
      FROM tasks
      WHERE (created_by = $1 OR assigned_to = $1) 
        AND created_at >= CURRENT_TIMESTAMP - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `, [req.user.id]);

    res.json({
      success: true,
      data: {
        overview: statsResult.rows[0],
        priorityDistribution: priorityStatsResult.rows,
        monthlyProgress: monthlyStatsResult.rows
      }
    });

  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router; 