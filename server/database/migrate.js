const { query } = require('./connection');

const migrateDatabase = async () => {
  try {
    console.log('🔄 Starting database migration...');

    // Check if metadata column exists in responses table
    const metadataCheck = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'responses' AND column_name = 'metadata'
    `);

    if (metadataCheck.rows.length === 0) {
      console.log('📝 Adding metadata column to responses table...');
      await query('ALTER TABLE responses ADD COLUMN metadata JSONB DEFAULT \'{}\'');
      
      // Update existing records to have empty metadata
      await query('UPDATE responses SET metadata = \'{}\' WHERE metadata IS NULL');
      console.log('✅ Metadata column added successfully');
    }

    // Check if soft delete columns exist in surveys table
    const surveySoftDeleteCheck = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'surveys' AND column_name = 'is_deleted'
    `);

    if (surveySoftDeleteCheck.rows.length === 0) {
      console.log('📝 Adding soft delete columns to surveys table...');
      await query('ALTER TABLE surveys ADD COLUMN is_deleted BOOLEAN DEFAULT false');
      await query('ALTER TABLE surveys ADD COLUMN deleted_at TIMESTAMP');
      await query('ALTER TABLE surveys ADD COLUMN deleted_by INTEGER REFERENCES users(id)');
      console.log('✅ Soft delete columns added to surveys table');
    }

    // Check if soft delete columns exist in questions table
    const questionSoftDeleteCheck = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'questions' AND column_name = 'is_deleted'
    `);

    if (questionSoftDeleteCheck.rows.length === 0) {
      console.log('📝 Adding soft delete columns to questions table...');
      await query('ALTER TABLE questions ADD COLUMN is_deleted BOOLEAN DEFAULT false');
      await query('ALTER TABLE questions ADD COLUMN deleted_at TIMESTAMP');
      console.log('✅ Soft delete columns added to questions table');
    }

    // Check if survey_versions table exists
    const versionsTableCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'survey_versions'
    `);

    if (versionsTableCheck.rows.length === 0) {
      console.log('📝 Creating survey_versions table...');
      await query(`
        CREATE TABLE survey_versions (
          id SERIAL PRIMARY KEY,
          survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
          version_number INTEGER NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          theme JSONB DEFAULT '{}',
          settings JSONB DEFAULT '{}',
          questions_data JSONB NOT NULL,
          created_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Survey versions table created');
    }

    // Check if custom_templates table exists
    const customTemplatesCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'custom_templates'
    `);

    if (customTemplatesCheck.rows.length === 0) {
      console.log('📝 Creating custom_templates table...');
      await query(`
        CREATE TABLE custom_templates (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100),
          template_data JSONB NOT NULL,
          is_public BOOLEAN DEFAULT false,
          is_deleted BOOLEAN DEFAULT false,
          deleted_at TIMESTAMP,
          deleted_by INTEGER REFERENCES users(id),
          created_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Custom templates table created');
    }

    // Check if soft delete columns exist in survey_templates table
    const templateSoftDeleteCheck = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'survey_templates' AND column_name = 'is_deleted'
    `);

    if (templateSoftDeleteCheck.rows.length === 0) {
      console.log('📝 Adding soft delete columns to survey_templates table...');
      await query('ALTER TABLE survey_templates ADD COLUMN is_deleted BOOLEAN DEFAULT false');
      await query('ALTER TABLE survey_templates ADD COLUMN deleted_at TIMESTAMP');
      await query('ALTER TABLE survey_templates ADD COLUMN deleted_by INTEGER REFERENCES users(id)');
      console.log('✅ Soft delete columns added to survey_templates table');
    }

    // Check if soft delete columns exist in images table
    const imageSoftDeleteCheck = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'images' AND column_name = 'is_deleted'
    `);

    if (imageSoftDeleteCheck.rows.length === 0) {
      console.log('📝 Adding soft delete columns to images table...');
      await query('ALTER TABLE images ADD COLUMN is_deleted BOOLEAN DEFAULT false');
      await query('ALTER TABLE images ADD COLUMN deleted_at TIMESTAMP');
      console.log('✅ Soft delete columns added to images table');
    }

    // Check if enhanced metadata columns exist in responses table
    const ipAddressCheck = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'responses' AND column_name = 'ip_address'
    `);

    if (ipAddressCheck.rows.length === 0) {
      console.log('📝 Adding enhanced metadata columns to responses table...');
      await query('ALTER TABLE responses ADD COLUMN ip_address INET');
      await query('ALTER TABLE responses ADD COLUMN user_agent TEXT');
      console.log('✅ Enhanced metadata columns added to responses table');
    }

    // Check if is_active column exists in users table
    const userActiveCheck = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_active'
    `);

    if (userActiveCheck.rows.length === 0) {
      console.log('📝 Adding is_active column to users table...');
      await query('ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true');
      console.log('✅ is_active column added to users table');
    }

    // Add updated_at column to survey_templates if it doesn't exist
    try {
      console.log('📝 Adding updated_at column to survey_templates table...');
      await query(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'survey_templates' AND column_name = 'updated_at'
          ) THEN
            ALTER TABLE survey_templates ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
          END IF;
        END $$;
      `);
      console.log('✅ Updated_at column added to survey_templates table');
    } catch (error) {
      console.log('⚠️  Updated_at column already exists or error:', error.message);
    }

    // Create indexes for better performance
    console.log('📝 Creating indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status)',
      'CREATE INDEX IF NOT EXISTS idx_surveys_is_deleted ON surveys(is_deleted)',
      'CREATE INDEX IF NOT EXISTS idx_questions_is_deleted ON questions(is_deleted)',
      'CREATE INDEX IF NOT EXISTS idx_responses_session_id ON responses(session_id)',
      'CREATE INDEX IF NOT EXISTS idx_images_is_deleted ON images(is_deleted)',
      'CREATE INDEX IF NOT EXISTS idx_survey_templates_is_deleted ON survey_templates(is_deleted)',
      'CREATE INDEX IF NOT EXISTS idx_custom_templates_created_by ON custom_templates(created_by)',
      'CREATE INDEX IF NOT EXISTS idx_custom_templates_is_deleted ON custom_templates(is_deleted)',
      'CREATE INDEX IF NOT EXISTS idx_survey_versions_survey_id ON survey_versions(survey_id)'
    ];

    for (const indexQuery of indexes) {
      await query(indexQuery);
    }
    console.log('✅ Indexes created successfully');

    // Insert default templates if they don't exist
    console.log('📝 Checking default templates...');
    const templateCount = await query('SELECT COUNT(*) as count FROM survey_templates WHERE is_deleted = false');
    
    if (templateCount.rows[0].count === '0') {
      console.log('📝 Inserting default templates...');
      
      const defaultTemplates = [
        {
          name: 'Customer Satisfaction Survey',
          description: 'A comprehensive customer satisfaction survey with emoji rating scales',
          category: 'Customer Feedback',
          template_data: {
            title: 'Customer Satisfaction Survey',
            description: 'Help us improve by sharing your experience',
            questions: [
              {
                type: 'emoji_scale',
                title: 'How satisfied are you with our service?',
                options: [
                  { value: 1, label: 'Very Dissatisfied', emoji: '😞' },
                  { value: 2, label: 'Dissatisfied', emoji: '😐' },
                  { value: 3, label: 'Neutral', emoji: '😐' },
                  { value: 4, label: 'Satisfied', emoji: '🙂' },
                  { value: 5, label: 'Very Satisfied', emoji: '😊' }
                ]
              },
              {
                type: 'text',
                title: 'What could we improve?',
                required: false
              },
              {
                type: 'multiple_choice',
                title: 'How did you hear about us?',
                options: ['Social Media', 'Friend Recommendation', 'Advertisement', 'Search Engine', 'Other']
              }
            ]
          },
          is_public: true
        },
        {
          name: 'Employee Feedback Survey',
          description: 'Gather feedback from your team members',
          category: 'Employee Feedback',
          template_data: {
            title: 'Employee Feedback Survey',
            description: 'Help us improve the workplace environment',
            questions: [
              {
                type: 'emoji_scale',
                title: 'How satisfied are you with your current role?',
                options: [
                  { value: 1, label: 'Very Unsatisfied', emoji: '😠' },
                  { value: 2, label: 'Unsatisfied', emoji: '😞' },
                  { value: 3, label: 'Neutral', emoji: '😐' },
                  { value: 4, label: 'Satisfied', emoji: '🙂' },
                  { value: 5, label: 'Very Satisfied', emoji: '🥰' }
                ]
              },
              {
                type: 'emoji_scale',
                title: 'How would you rate the work-life balance?',
                options: [
                  { value: 1, label: 'Poor', emoji: '⭐' },
                  { value: 2, label: 'Fair', emoji: '⭐⭐' },
                  { value: 3, label: 'Good', emoji: '⭐⭐⭐' },
                  { value: 4, label: 'Very Good', emoji: '⭐⭐⭐⭐' },
                  { value: 5, label: 'Excellent', emoji: '⭐⭐⭐⭐⭐' }
                ]
              },
              {
                type: 'multiple_choice',
                title: 'What would you like to see improved?',
                options: ['Communication', 'Training & Development', 'Benefits & Compensation', 'Company Culture', 'Tools & Resources']
              },
              {
                type: 'text',
                title: 'Any additional suggestions for improvement?',
                required: false
              }
            ]
          },
          is_public: true
        }
      ];

      for (const template of defaultTemplates) {
        await query(`
          INSERT INTO survey_templates (name, description, category, template_data, is_public)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING
        `, [
          template.name,
          template.description,
          template.category,
          JSON.stringify(template.template_data),
          template.is_public
        ]);
      }
      console.log('✅ Default templates inserted successfully');
    } else {
      console.log('✅ Default templates already exist');
    }

    console.log('🎉 Database migration completed successfully!');
    console.log('📊 All surveys, templates, and drafts are now permanently saved with soft delete functionality');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateDatabase();
}

module.exports = { migrateDatabase }; 