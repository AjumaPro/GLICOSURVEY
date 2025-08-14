const bcrypt = require('bcryptjs');
const { query } = require('../database/connection');
require('dotenv').config();

const createSuperAdmin = async () => {
  try {
    console.log('🔧 Creating super admin user...');

    const email = process.env.SUPER_ADMIN_EMAIL || 'admin@glico.com';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'admin123';
    const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';

    // Check if super admin already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  Super admin user already exists with email:', email);
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create super admin user
    const result = await query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role`,
      [email, passwordHash, name, 'super_admin']
    );

    const user = result.rows[0];

    console.log('✅ Super admin user created successfully!');
    console.log('📧 Email:', user.email);
    console.log('👤 Name:', user.name);
    console.log('🔑 Role:', user.role);
    console.log('🆔 ID:', user.id);
    console.log('');
    console.log('🔐 Default password:', password);
    console.log('⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    process.exit(1);
  }
};

// Run the script
createSuperAdmin().then(() => {
  console.log('🎉 Script completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
}); 