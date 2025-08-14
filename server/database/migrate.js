const { query } = require('./connection');

const migrateDatabase = async () => {
  try {
    console.log('🔄 Starting database migration...');

    // Check if metadata column exists
    const checkColumn = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'responses' 
      AND column_name = 'metadata'
    `);

    if (checkColumn.rows.length === 0) {
      console.log('📝 Adding metadata column to responses table...');
      
      // Add metadata column
      await query(`
        ALTER TABLE responses 
        ADD COLUMN metadata JSONB DEFAULT '{}'
      `);
      
      console.log('✅ Metadata column added successfully');
    } else {
      console.log('✅ Metadata column already exists');
    }

    // Check if we need to update existing responses with empty metadata
    const updateExisting = await query(`
      UPDATE responses 
      SET metadata = '{}' 
      WHERE metadata IS NULL
    `);
    
    console.log(`📊 Updated ${updateExisting.rowCount} existing responses with empty metadata`);

    console.log('🎉 Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log('✅ Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateDatabase }; 