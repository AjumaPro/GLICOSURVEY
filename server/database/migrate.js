const { query } = require('./connection');

const migrateDatabase = async () => {
  try {
    console.log('🔄 Starting SQLite database migration...');

    // Check if metadata column exists in responses table
    const metadataCheck = await query(`
      SELECT name FROM pragma_table_info('responses') WHERE name = 'metadata'
    `);

    if (metadataCheck.rows.length === 0) {
      console.log('📝 Adding metadata column to responses table...');
      await query('ALTER TABLE responses ADD COLUMN metadata TEXT DEFAULT \'{}\'');
      
      // Update existing records to have empty metadata
      await query('UPDATE responses SET metadata = \'{}\' WHERE metadata IS NULL');
      console.log('✅ Metadata column added successfully');
    }

    // Check if soft delete columns exist in surveys table
    const surveySoftDeleteCheck = await query(`
      SELECT name FROM pragma_table_info('surveys') WHERE name = 'is_deleted'
    `);

    if (surveySoftDeleteCheck.rows.length === 0) {
      console.log('📝 Adding soft delete columns to surveys table...');
      await query('ALTER TABLE surveys ADD COLUMN is_deleted INTEGER DEFAULT 0');
      await query('ALTER TABLE surveys ADD COLUMN deleted_at TEXT');
      await query('ALTER TABLE surveys ADD COLUMN deleted_by INTEGER');
      console.log('✅ Soft delete columns added to surveys table');
    }

    // Check if soft delete columns exist in questions table
    const questionSoftDeleteCheck = await query(`
      SELECT name FROM pragma_table_info('questions') WHERE name = 'is_deleted'
    `);

    if (questionSoftDeleteCheck.rows.length === 0) {
      console.log('📝 Adding soft delete columns to questions table...');
      await query('ALTER TABLE questions ADD COLUMN is_deleted INTEGER DEFAULT 0');
      await query('ALTER TABLE questions ADD COLUMN deleted_at TEXT');
      await query('ALTER TABLE questions ADD COLUMN deleted_by INTEGER');
      console.log('✅ Soft delete columns added to questions table');
    }

    // Check if soft delete columns exist in survey_templates table
    const templateSoftDeleteCheck = await query(`
      SELECT name FROM pragma_table_info('survey_templates') WHERE name = 'is_deleted'
    `);

    if (templateSoftDeleteCheck.rows.length === 0) {
      console.log('📝 Adding soft delete columns to survey_templates table...');
      await query('ALTER TABLE survey_templates ADD COLUMN is_deleted INTEGER DEFAULT 0');
      await query('ALTER TABLE survey_templates ADD COLUMN deleted_at TEXT');
      await query('ALTER TABLE survey_templates ADD COLUMN deleted_by INTEGER');
      console.log('✅ Soft delete columns added to survey_templates table');
    }

    // Check if soft delete columns exist in custom_templates table
    const customTemplateSoftDeleteCheck = await query(`
      SELECT name FROM pragma_table_info('custom_templates') WHERE name = 'is_deleted'
    `);

    if (customTemplateSoftDeleteCheck.rows.length === 0) {
      console.log('📝 Adding soft delete columns to custom_templates table...');
      await query('ALTER TABLE custom_templates ADD COLUMN is_deleted INTEGER DEFAULT 0');
      await query('ALTER TABLE custom_templates ADD COLUMN deleted_at TEXT');
      await query('ALTER TABLE custom_templates ADD COLUMN deleted_by INTEGER');
      console.log('✅ Soft delete columns added to custom_templates table');
    }

    // Check if ip_address column exists in responses table
    const ipAddressCheck = await query(`
      SELECT name FROM pragma_table_info('responses') WHERE name = 'ip_address'
    `);

    if (ipAddressCheck.rows.length === 0) {
      console.log('📝 Adding ip_address column to responses table...');
      await query('ALTER TABLE responses ADD COLUMN ip_address TEXT');
      console.log('✅ IP address column added to responses table');
    }

    // Check if user_agent column exists in responses table
    const userAgentCheck = await query(`
      SELECT name FROM pragma_table_info('responses') WHERE name = 'user_agent'
    `);

    if (userAgentCheck.rows.length === 0) {
      console.log('📝 Adding user_agent column to responses table...');
      await query('ALTER TABLE responses ADD COLUMN user_agent TEXT');
      console.log('✅ User agent column added to responses table');
    }

    console.log('✅ Database migration completed successfully');

  } catch (error) {
    console.error('❌ Database migration failed:', error);
    throw error;
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log('🎉 Database migration complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database migration failed:', error);
      process.exit(1);
    });
}

module.exports = {
  migrateDatabase
}; 