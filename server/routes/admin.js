const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../database/connection');
const auth = require('../middleware/auth');

// Middleware to check if user is admin or super admin
const requireAdmin = async (req, res, next) => {
  try {
    const userResult = await query(
      'SELECT role FROM users WHERE id = ?',
      [req.user.id]
    );

    if (userResult.rows.length === 0 || (userResult.rows[0].role !== 'admin' && userResult.rows[0].role !== 'super_admin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to check if user is super admin
const requireSuperAdmin = async (req, res, next) => {
  try {
    const userResult = await query(
      'SELECT role FROM users WHERE id = ?',
      [req.user.id]
    );

    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    next();
  } catch (error) {
    console.error('Error checking super admin status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/admin/users - Get all users
router.get('/users', auth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    const offset = (page - 1) * limit;

    // Get the authenticated user's role to determine visibility
    const adminResult = await query(
      'SELECT role FROM users WHERE id = $1',
      [req.user.id]
    );

    if (adminResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const adminUser = adminResult.rows[0];
    let whereClause = '';
    let params = [];
    let paramCount = 0;

    // If admin (not super admin), filter out super admin accounts except those they created
    if (adminUser.role === 'admin') {
      paramCount++;
      whereClause = `WHERE (role != 'super_admin' OR created_by = $${paramCount})`;
      params.push(req.user.id);
    }

    if (search) {
      paramCount++;
      const searchCondition = whereClause ? 'AND' : 'WHERE';
      whereClause += ` ${searchCondition} (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (role) {
      paramCount++;
      const roleCondition = whereClause ? 'AND' : 'WHERE';
      whereClause += ` ${roleCondition} role = $${paramCount}`;
      params.push(role);
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      params
    );
    const totalUsers = parseInt(countResult.rows[0].count);

    const usersResult = await query(
      `SELECT id, email, name, role, created_at, updated_at,
              (SELECT COUNT(*) FROM surveys WHERE user_id = users.id) as survey_count
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    res.json({
      users: usersResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/admin/users - Create new user
router.post('/users', auth, requireAdmin, async (req, res) => {
  try {
    // Check if the authenticated user is an admin or super admin
    const adminResult = await query(
      'SELECT role FROM users WHERE id = $1',
      [req.user.id]
    );

    if (adminResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const adminUser = adminResult.rows[0];
    const { email, password, name, role = 'user' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Validate role (admins can only create regular users, super admins can create any role)
    const validRoles = ['user', 'admin'];
    if (adminUser.role === 'admin' && role !== 'user') {
      return res.status(403).json({ error: 'Admins can only create regular user accounts' });
    }

    if (adminUser.role === 'super_admin') {
      validRoles.push('super_admin');
    }

    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await query(
      `INSERT INTO users (email, password_hash, name, role, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role, created_at`,
      [email, passwordHash, name, role, req.user.id]
    );

    const user = result.rows[0];

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/admin/users/:id - Update user
router.put('/users/:id', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role, password } = req.body;

    const existingUser = await query(
      'SELECT id, role FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot modify your own account through admin panel' });
    }

    // Super admins can modify any role, including other super admins
    if (role) {
      const validRoles = ['user', 'admin', 'super_admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
    }

    if (email) {
      const emailCheck = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email already taken by another user' });
      }
    }

    let updateFields = [];
    let params = [];
    let paramCount = 0;

    if (email) {
      paramCount++;
      updateFields.push(`email = $${paramCount}`);
      params.push(email);
    }

    if (name) {
      paramCount++;
      updateFields.push(`name = $${paramCount}`);
      params.push(name);
    }

    if (role) {
      paramCount++;
      updateFields.push(`role = $${paramCount}`);
      params.push(role);
    }

    if (password) {
      paramCount++;
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      updateFields.push(`password_hash = $${paramCount}`);
      params.push(passwordHash);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    paramCount++;
    params.push(id);

    const result = await query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount}
       RETURNING id, email, name, role, created_at, updated_at`,
      params
    );

    const user = result.rows[0];

    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await query(
      'SELECT id, role FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Super admins can delete any user, including other super admins
    // But we'll add a warning for deleting super admins
    const isDeletingSuperAdmin = existingUser.rows[0].role === 'super_admin';

    await query('DELETE FROM users WHERE id = $1', [id]);

    const message = isDeletingSuperAdmin 
      ? 'Super admin user deleted successfully' 
      : 'User deleted successfully';

    res.json({ 
      message,
      warning: isDeletingSuperAdmin ? 'A super admin account was deleted' : undefined
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// GET /api/admin/users/:id/password - Get user password (super admin only)
router.get('/users/:id/password', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await query(
      'SELECT id, email, name, password_hash FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot view your own password through admin panel' });
    }

    const user = userResult.rows[0];

    res.json({
      message: 'Password hash retrieved successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        password_hash: user.password_hash
      }
    });

  } catch (error) {
    console.error('Error fetching user password:', error);
    res.status(500).json({ error: 'Failed to fetch user password' });
  }
});

// POST /api/admin/users/:id/reset-password - Reset user password (super admin only)
router.post('/users/:id/reset-password', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      return res.status(400).json({ error: 'New password is required' });
    }

    const existingUser = await query(
      'SELECT id, email, name FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot reset your own password through admin panel' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(new_password, saltRounds);

    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, id]
    );

    const user = existingUser.rows[0];

    res.json({
      message: 'Password reset successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Error resetting user password:', error);
    res.status(500).json({ error: 'Failed to reset user password' });
  }
});

// POST /api/admin/invite - Invite team member (admin/super admin)
router.post('/invite', auth, requireAdmin, async (req, res) => {
  try {
    const { email, name, role = 'user', message } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    // Check if the authenticated user is an admin or super admin
    const adminResult = await query(
      'SELECT role FROM users WHERE id = $1',
      [req.user.id]
    );

    if (adminResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const adminUser = adminResult.rows[0];

    // Validate role permissions
    const validRoles = ['user', 'admin'];
    if (adminUser.role === 'admin' && role !== 'user') {
      return res.status(403).json({ error: 'Admins can only invite regular user accounts' });
    }

    if (adminUser.role === 'super_admin') {
      validRoles.push('super_admin');
    }

    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4);
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(tempPassword, saltRounds);

    // Create the user
    const result = await query(
      `INSERT INTO users (email, password_hash, name, role, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role, created_at`,
      [email, passwordHash, name, role, req.user.id]
    );

    const user = result.rows[0];

    // TODO: Send invitation email with temporary password
    // For now, we'll return the temporary password in the response
    // In production, this should be sent via email

    res.status(201).json({
      message: 'Team member invited successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at
      },
      invitation: {
        temporary_password: tempPassword,
        message: message || `Welcome to the team! Your temporary password is: ${tempPassword}`
      }
    });

  } catch (error) {
    console.error('Error inviting team member:', error);
    res.status(500).json({ error: 'Failed to invite team member' });
  }
});

// GET /api/admin/stats - Get admin dashboard stats
router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    // Get the authenticated user's role to determine visibility
    const adminResult = await query(
      'SELECT role FROM users WHERE id = $1',
      [req.user.id]
    );

    if (adminResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const adminUser = adminResult.rows[0];
    let userStatsQuery = '';
    let userStatsParams = [];

    // If admin (not super admin), filter out super admin accounts except those they created
    if (adminUser.role === 'admin') {
      userStatsQuery = `
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
          COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admin_users,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_users_7d
        FROM users
        WHERE (role != 'super_admin' OR created_by = $1)
      `;
      userStatsParams = [req.user.id];
    } else {
      userStatsQuery = `
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
          COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admin_users,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_users_7d
        FROM users
      `;
    }

    const statsResult = await query(userStatsQuery, userStatsParams);

    const surveyStatsResult = await query(`
      SELECT 
        COUNT(*) as total_surveys,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_surveys,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_surveys
      FROM surveys
    `);

    const responseStatsResult = await query(`
      SELECT 
        COUNT(*) as total_responses,
        COUNT(DISTINCT respondent_id) as unique_respondents
      FROM responses
    `);

    res.json({
      userStats: statsResult.rows[0],
      surveyStats: surveyStatsResult.rows[0],
      responseStats: responseStatsResult.rows[0]
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

module.exports = router; 