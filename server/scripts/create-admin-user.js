const bcrypt = require('bcryptjs');
const { query } = require('../database/connection');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    console.log('🔧 Creating admin user...');

    const email = 'admin@test.com';
    const password = 'admin123';
    const name = 'Test Admin';

    // Check if admin already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  Admin user already exists with email:', email);
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const result = await query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role`,
      [email, passwordHash, name, 'admin']
    );

    const user = result.rows[0];

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', user.email);
    console.log('👤 Name:', user.name);
    console.log('🔑 Role:', user.role);
    console.log('🆔 ID:', user.id);
    console.log('');
    console.log('🔐 Password:', password);
    console.log('⚠️  This is a test account - change password in production!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the script
createAdminUser().then(() => {
  console.log('🎉 Script completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
}); 