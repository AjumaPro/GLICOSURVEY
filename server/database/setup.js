const { query } = require('./connection');

const createTables = async () => {
  try {
    console.log('🗄️ Setting up database tables...');

    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Surveys table with soft delete
    await query(`
      CREATE TABLE IF NOT EXISTS surveys (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        user_id INTEGER REFERENCES users(id) ON DELETE RESTRICT,
        status VARCHAR(50) DEFAULT 'draft',
        theme JSONB DEFAULT '{}',
        settings JSONB DEFAULT '{}',
        is_deleted BOOLEAN DEFAULT false,
        deleted_at TIMESTAMP,
        deleted_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Questions table with soft delete
    await query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        required BOOLEAN DEFAULT false,
        options JSONB DEFAULT '[]',
        settings JSONB DEFAULT '{}',
        order_index INTEGER DEFAULT 0,
        is_deleted BOOLEAN DEFAULT false,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Responses table with enhanced metadata
    await query(`
      CREATE TABLE IF NOT EXISTS responses (
        id SERIAL PRIMARY KEY,
        survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        answer JSONB NOT NULL,
        respondent_id VARCHAR(255),
        session_id VARCHAR(255),
        metadata JSONB DEFAULT '{}',
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Survey templates table with soft delete
    await query(`
      CREATE TABLE IF NOT EXISTS survey_templates (
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

    // Custom templates table for user-created templates
    await query(`
      CREATE TABLE IF NOT EXISTS custom_templates (
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

    // Images table for custom assets
    await query(`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        size INTEGER NOT NULL,
        url VARCHAR(500) NOT NULL,
        firebase_path VARCHAR(500),
        is_deleted BOOLEAN DEFAULT false,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Survey versions table for version control
    await query(`
      CREATE TABLE IF NOT EXISTS survey_versions (
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

    // Create indexes for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_surveys_user_id ON surveys(user_id);
      CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
      CREATE INDEX IF NOT EXISTS idx_surveys_is_deleted ON surveys(is_deleted);
      CREATE INDEX IF NOT EXISTS idx_questions_survey_id ON questions(survey_id);
      CREATE INDEX IF NOT EXISTS idx_questions_is_deleted ON questions(is_deleted);
      CREATE INDEX IF NOT EXISTS idx_responses_survey_id ON responses(survey_id);
      CREATE INDEX IF NOT EXISTS idx_responses_question_id ON responses(question_id);
      CREATE INDEX IF NOT EXISTS idx_responses_session_id ON responses(session_id);
      CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);
      CREATE INDEX IF NOT EXISTS idx_images_is_deleted ON images(is_deleted);
      CREATE INDEX IF NOT EXISTS idx_survey_templates_is_deleted ON survey_templates(is_deleted);
      CREATE INDEX IF NOT EXISTS idx_custom_templates_created_by ON custom_templates(created_by);
      CREATE INDEX IF NOT EXISTS idx_custom_templates_is_deleted ON custom_templates(is_deleted);
      CREATE INDEX IF NOT EXISTS idx_survey_versions_survey_id ON survey_versions(survey_id);
    `);

    console.log('✅ Database tables created successfully!');

    // Insert default survey templates
    await insertDefaultTemplates();

    console.log('✅ Default survey templates created!');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
};

const insertDefaultTemplates = async () => {
  const templates = [
    {
      name: 'Customer Satisfaction Survey',
      description: 'A basic customer satisfaction survey with emoji rating scales',
      category: 'Customer Feedback',
      template_data: {
        title: 'Customer Satisfaction Survey',
        description: 'Help us improve by sharing your experience',
        questions: [
          {
            type: 'emoji_scale',
            title: 'How satisfied are you with our service?',
            options: [
              { emoji: '😞', label: 'Very Dissatisfied', value: 1 },
              { emoji: '😐', label: 'Dissatisfied', value: 2 },
              { emoji: '😐', label: 'Neutral', value: 3 },
              { emoji: '🙂', label: 'Satisfied', value: 4 },
              { emoji: '😊', label: 'Very Satisfied', value: 5 }
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
      name: 'Restaurant Experience Survey',
      description: 'Gather feedback about dining experience, food quality, and service',
      category: 'Restaurant Feedback',
      template_data: {
        title: 'Restaurant Experience Survey',
        description: 'Help us improve your dining experience',
        questions: [
          {
            type: 'emoji_scale',
            title: 'How would you rate the food quality?',
            options: [
              { emoji: '⭐', label: 'Poor', value: 1 },
              { emoji: '⭐⭐', label: 'Fair', value: 2 },
              { emoji: '⭐⭐⭐', label: 'Good', value: 3 },
              { emoji: '⭐⭐⭐⭐', label: 'Very Good', value: 4 },
              { emoji: '⭐⭐⭐⭐⭐', label: 'Excellent', value: 5 }
            ]
          },
          {
            type: 'emoji_scale',
            title: 'How would you rate the service?',
            options: [
              { emoji: '😞', label: 'Very Poor', value: 1 },
              { emoji: '😐', label: 'Poor', value: 2 },
              { emoji: '😐', label: 'Average', value: 3 },
              { emoji: '🙂', label: 'Good', value: 4 },
              { emoji: '😊', label: 'Excellent', value: 5 }
            ]
          },
          {
            type: 'multiple_choice',
            title: 'What type of cuisine did you order?',
            options: ['Local', 'International', 'Fusion', 'Vegetarian', 'Fast Food']
          },
          {
            type: 'text',
            title: 'Any specific feedback about your experience?',
            required: false
          }
        ]
      },
      is_public: true
    },
    {
      name: 'Hotel Experience Survey',
      description: 'Evaluate hotel stay experience, amenities, and staff service',
      category: 'Hospitality Feedback',
      template_data: {
        title: 'Hotel Experience Survey',
        description: 'Help us improve your stay experience',
        questions: [
          {
            type: 'emoji_scale',
            title: 'How would you rate your overall stay?',
            options: [
              { emoji: '😞', label: 'Very Dissatisfied', value: 1 },
              { emoji: '😐', label: 'Dissatisfied', value: 2 },
              { emoji: '😐', label: 'Neutral', value: 3 },
              { emoji: '🙂', label: 'Satisfied', value: 4 },
              { emoji: '😊', label: 'Very Satisfied', value: 5 }
            ]
          },
          {
            type: 'emoji_scale',
            title: 'How would you rate the cleanliness?',
            options: [
              { emoji: '⭐', label: 'Poor', value: 1 },
              { emoji: '⭐⭐', label: 'Fair', value: 2 },
              { emoji: '⭐⭐⭐', label: 'Good', value: 3 },
              { emoji: '⭐⭐⭐⭐', label: 'Very Good', value: 4 },
              { emoji: '⭐⭐⭐⭐⭐', label: 'Excellent', value: 5 }
            ]
          },
          {
            type: 'multiple_choice',
            title: 'Which amenities did you use?',
            options: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Spa', 'None']
          },
          {
            type: 'text',
            title: 'Any suggestions for improvement?',
            required: false
          }
        ]
      },
      is_public: true
    },
    {
      name: 'E-commerce Feedback Survey',
      description: 'Collect feedback on online shopping experience and product satisfaction',
      category: 'E-commerce Feedback',
      template_data: {
        title: 'E-commerce Feedback Survey',
        description: 'Help us improve your shopping experience',
        questions: [
          {
            type: 'emoji_scale',
            title: 'How satisfied are you with your purchase?',
            options: [
              { emoji: '😞', label: 'Very Dissatisfied', value: 1 },
              { emoji: '😐', label: 'Dissatisfied', value: 2 },
              { emoji: '😐', label: 'Neutral', value: 3 },
              { emoji: '🙂', label: 'Satisfied', value: 4 },
              { emoji: '😊', label: 'Very Satisfied', value: 5 }
            ]
          },
          {
            type: 'emoji_scale',
            title: 'How would you rate the delivery service?',
            options: [
              { emoji: '⭐', label: 'Poor', value: 1 },
              { emoji: '⭐⭐', label: 'Fair', value: 2 },
              { emoji: '⭐⭐⭐', label: 'Good', value: 3 },
              { emoji: '⭐⭐⭐⭐', label: 'Very Good', value: 4 },
              { emoji: '⭐⭐⭐⭐⭐', label: 'Excellent', value: 5 }
            ]
          },
          {
            type: 'multiple_choice',
            title: 'How did you find our website?',
            options: ['Search Engine', 'Social Media', 'Advertisement', 'Friend Recommendation', 'Direct Link']
          },
          {
            type: 'text',
            title: 'What would make your shopping experience better?',
            required: false
          }
        ]
      },
      is_public: true
    },
    {
      name: 'Banking Service Survey',
      description: 'Evaluate banking services, customer support, and digital experience',
      category: 'Banking Feedback',
      template_data: {
        title: 'Banking Service Survey',
        description: 'Help us improve our banking services',
        questions: [
          {
            type: 'emoji_scale',
            title: 'How satisfied are you with our banking services?',
            options: [
              { emoji: '😞', label: 'Very Dissatisfied', value: 1 },
              { emoji: '😐', label: 'Dissatisfied', value: 2 },
              { emoji: '😐', label: 'Neutral', value: 3 },
              { emoji: '🙂', label: 'Satisfied', value: 4 },
              { emoji: '😊', label: 'Very Satisfied', value: 5 }
            ]
          },
          {
            type: 'emoji_scale',
            title: 'How would you rate our mobile banking app?',
            options: [
              { emoji: '⭐', label: 'Poor', value: 1 },
              { emoji: '⭐⭐', label: 'Fair', value: 2 },
              { emoji: '⭐⭐⭐', label: 'Good', value: 3 },
              { emoji: '⭐⭐⭐⭐', label: 'Very Good', value: 4 },
              { emoji: '⭐⭐⭐⭐⭐', label: 'Excellent', value: 5 }
            ]
          },
          {
            type: 'multiple_choice',
            title: 'Which services do you use most?',
            options: ['Online Banking', 'Mobile Banking', 'ATM Services', 'Branch Services', 'Customer Support']
          },
          {
            type: 'text',
            title: 'Any suggestions for improving our services?',
            required: false
          }
        ]
      },
      is_public: true
    },
    {
      name: 'Healthcare Experience Survey',
      description: 'Collect feedback on healthcare services, staff, and facilities',
      category: 'Healthcare Feedback',
      template_data: {
        title: 'Healthcare Experience Survey',
        description: 'Help us improve our healthcare services',
        questions: [
          {
            type: 'emoji_scale',
            title: 'How satisfied are you with your healthcare experience?',
            options: [
              { emoji: '😞', label: 'Very Dissatisfied', value: 1 },
              { emoji: '😐', label: 'Dissatisfied', value: 2 },
              { emoji: '😐', label: 'Neutral', value: 3 },
              { emoji: '🙂', label: 'Satisfied', value: 4 },
              { emoji: '😊', label: 'Very Satisfied', value: 5 }
            ]
          },
          {
            type: 'emoji_scale',
            title: 'How would you rate the medical staff?',
            options: [
              { emoji: '⭐', label: 'Poor', value: 1 },
              { emoji: '⭐⭐', label: 'Fair', value: 2 },
              { emoji: '⭐⭐⭐', label: 'Good', value: 3 },
              { emoji: '⭐⭐⭐⭐', label: 'Very Good', value: 4 },
              { emoji: '⭐⭐⭐⭐⭐', label: 'Excellent', value: 5 }
            ]
          },
          {
            type: 'multiple_choice',
            title: 'What type of service did you receive?',
            options: ['Consultation', 'Treatment', 'Surgery', 'Emergency Care', 'Preventive Care']
          },
          {
            type: 'text',
            title: 'Any feedback about your experience?',
            required: false
          }
        ]
      },
      is_public: true
    },
    {
      name: 'Transportation Service Survey',
      description: 'Evaluate transportation services, safety, and customer experience',
      category: 'Transportation Feedback',
      template_data: {
        title: 'Transportation Service Survey',
        description: 'Help us improve our transportation services',
        questions: [
          {
            type: 'emoji_scale',
            title: 'How satisfied are you with our transportation service?',
            options: [
              { emoji: '😞', label: 'Very Dissatisfied', value: 1 },
              { emoji: '😐', label: 'Dissatisfied', value: 2 },
              { emoji: '😐', label: 'Neutral', value: 3 },
              { emoji: '🙂', label: 'Satisfied', value: 4 },
              { emoji: '😊', label: 'Very Satisfied', value: 5 }
            ]
          },
          {
            type: 'emoji_scale',
            title: 'How would you rate the safety standards?',
            options: [
              { emoji: '⭐', label: 'Poor', value: 1 },
              { emoji: '⭐⭐', label: 'Fair', value: 2 },
              { emoji: '⭐⭐⭐', label: 'Good', value: 3 },
              { emoji: '⭐⭐⭐⭐', label: 'Very Good', value: 4 },
              { emoji: '⭐⭐⭐⭐⭐', label: 'Excellent', value: 5 }
            ]
          },
          {
            type: 'multiple_choice',
            title: 'What type of transportation do you use?',
            options: ['Bus', 'Train', 'Taxi', 'Ride-sharing', 'Airport Transfer']
          },
          {
            type: 'text',
            title: 'Any suggestions for improvement?',
            required: false
          }
        ]
      },
      is_public: true
    }
  ];

  for (const template of templates) {
    const existingTemplate = await query(
      'SELECT id FROM survey_templates WHERE name = $1',
      [template.name]
    );

    if (existingTemplate.rows.length === 0) {
      await query(
        `INSERT INTO survey_templates (name, description, category, template_data, is_public)
         VALUES ($1, $2, $3, $4, $5)`,
        [template.name, template.description, template.category, JSON.stringify(template.template_data), template.is_public]
      );
    }
  }
};

const dropTables = async () => {
  try {
    console.log('🗑️ Dropping all tables...');
    
    await query('DROP TABLE IF EXISTS survey_versions CASCADE');
    await query('DROP TABLE IF EXISTS responses CASCADE');
    await query('DROP TABLE IF EXISTS questions CASCADE');
    await query('DROP TABLE IF EXISTS images CASCADE');
    await query('DROP TABLE IF EXISTS custom_templates CASCADE');
    await query('DROP TABLE IF EXISTS survey_templates CASCADE');
    await query('DROP TABLE IF EXISTS surveys CASCADE');
    await query('DROP TABLE IF EXISTS users CASCADE');
    
    console.log('✅ All tables dropped successfully!');
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    process.exit(1);
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'drop') {
    dropTables();
  } else {
    createTables();
  }
}

module.exports = { createTables, dropTables }; 