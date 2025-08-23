const { query } = require('../database/connection');
require('dotenv').config();

const updateGuestRole = async () => {
  try {
    console.log('🔧 Updating guest user role...');

    const email = 'guest@glico.com';

    // Update guest user role from admin to user
    const result = await query(
      `UPDATE users 
       SET role = 'user' 
       WHERE email = $1 
       RETURNING id, email, name, role, is_active`,
      [email]
    );

    if (result.rows.length === 0) {
      console.log('⚠️  Guest user not found with email:', email);
      return;
    }

    const user = result.rows[0];

    console.log('✅ Guest user role updated successfully!');
    console.log('📧 Email:', user.email);
    console.log('👤 Name:', user.name);
    console.log('🔑 Role:', user.role);
    console.log('🆔 ID:', user.id);
    console.log('✅ Active:', user.is_active);
    console.log('');
    console.log('🎯 Access: Can create, edit, delete surveys, view analytics, manage templates');
    console.log('🚫 Restricted: No access to admin dashboard');
    console.log('⚠️  Guest account now has user privileges!');

  } catch (error) {
    console.error('❌ Error updating guest user role:', error);
    process.exit(1);
  }
};

// Run the script
updateGuestRole().then(() => {
  console.log('🎉 Guest role update completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Guest role update failed:', error);
  process.exit(1);
}); 