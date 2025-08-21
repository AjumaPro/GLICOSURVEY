const bcrypt = require('bcryptjs');
const { query } = require('../database/connection');
require('dotenv').config();

const createGuestUser = async () => {
  try {
    console.log('🔧 Creating guest user with full access...');

    const email = 'guest@glico.com';
    const password = 'guest123';
    const name = 'Guest User';

    // Check if guest already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  Guest user already exists with email:', email);
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create guest user with user role (all access except admin dashboard)
    const result = await query(
      `INSERT INTO users (email, password_hash, name, role, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role, is_active`,
      [email, passwordHash, name, 'user', true]
    );

    const user = result.rows[0];

    console.log('✅ Guest user created successfully!');
    console.log('📧 Email:', user.email);
    console.log('👤 Name:', user.name);
    console.log('🔑 Role:', user.role);
    console.log('🆔 ID:', user.id);
    console.log('✅ Active:', user.is_active);
    console.log('');
    console.log('🔐 Password:', password);
    console.log('🎯 Access: Can create, edit, delete surveys, view analytics, manage templates');
    console.log('🚫 Restricted: No access to admin dashboard');
    console.log('⚠️  This is a guest account with user privileges!');

  } catch (error) {
    console.error('❌ Error creating guest user:', error);
    process.exit(1);
  }
};

// Run the script
createGuestUser().then(() => {
  console.log('🎉 Guest user script completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Guest user script failed:', error);
  process.exit(1);
}); 