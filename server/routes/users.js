const express = require('express');
const { query } = require('../database/connection');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [];

    if (search) {
      whereClause = 'WHERE username ILIKE $1 OR email ILIKE $1 OR full_name ILIKE $1';
      params.push(`%${search}%`);
    }

    // Get users with pagination
    const usersResult = await query(
      `SELECT id, username, email, full_name, role, is_active, created_at, last_login
       FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM users
       ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        users: usersResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only view their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const result = await query(
      `SELECT id, username, email, full_name, role, avatar_url, is_active, created_at, last_login
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update user (admin only or own profile)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, full_name, role, is_active } = req.body;

    // Users can only update their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Non-admins can't change role or active status
    if (req.user.role !== 'admin') {
      delete req.body.role;
      delete req.body.is_active;
    }

    // Check if email is already taken
    if (email) {
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Email is already taken'
        });
      }
    }

    // Check if username is already taken
    if (username) {
      const existingUser = await query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, id]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Username is already taken'
        });
      }
    }

    const result = await query(
      `UPDATE users 
       SET username = COALESCE($1, username),
           email = COALESCE($2, email),
           full_name = COALESCE($3, full_name),
           role = COALESCE($4, role),
           is_active = COALESCE($5, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, username, email, full_name, role, avatar_url, is_active, created_at, last_login`,
      [username, email, full_name, role, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user statistics (admin only)
router.get('/stats/overview', auth, adminAuth, async (req, res) => {
  try {
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
        COUNT(CASE WHEN last_login > CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 1 END) as recent_logins
      FROM users
    `);

    const roleStatsResult = await query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY count DESC
    `);

    const monthlyStatsResult = await query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as new_users
      FROM users
      WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);

    res.json({
      success: true,
      data: {
        overview: statsResult.rows[0],
        roleDistribution: roleStatsResult.rows,
        monthlyGrowth: monthlyStatsResult.rows
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router; 