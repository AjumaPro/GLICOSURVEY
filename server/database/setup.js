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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Surveys table
    await query(`
      CREATE TABLE IF NOT EXISTS surveys (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'draft',
        theme JSONB DEFAULT '{}',
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Questions table
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Responses table
    await query(`
      CREATE TABLE IF NOT EXISTS responses (
        id SERIAL PRIMARY KEY,
        survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        answer JSONB NOT NULL,
        respondent_id VARCHAR(255),
        session_id VARCHAR(255),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Survey templates table
    await query(`
      CREATE TABLE IF NOT EXISTS survey_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        template_data JSONB NOT NULL,
        is_public BOOLEAN DEFAULT false,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_surveys_user_id ON surveys(user_id);
      CREATE INDEX IF NOT EXISTS idx_questions_survey_id ON questions(survey_id);
      CREATE INDEX IF NOT EXISTS idx_responses_survey_id ON responses(survey_id);
      CREATE INDEX IF NOT EXISTS idx_responses_question_id ON responses(question_id);
      CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);
    `);

    console.log('✅ Database tables created successfully!');

    // Insert default survey template
    await query(`
      INSERT INTO survey_templates (name, description, category, template_data, is_public)
      VALUES (
        'Customer Satisfaction Survey',
        'A basic customer satisfaction survey with emoji rating scales',
        'Customer Feedback',
        '{"title": "Customer Satisfaction Survey", "description": "Help us improve by sharing your experience", "questions": [{"type": "emoji_scale", "title": "How satisfied are you with our service?", "options": [{"value": 1, "label": "Very Dissatisfied", "emoji": "😞"}, {"value": 2, "label": "Dissatisfied", "emoji": "😐"}, {"value": 3, "label": "Neutral", "emoji": "😐"}, {"value": 4, "label": "Satisfied", "emoji": "🙂"}, {"value": 5, "label": "Very Satisfied", "emoji": "😊"}]}, {"type": "text", "title": "What could we improve?", "required": false}, {"type": "multiple_choice", "title": "How did you hear about us?", "options": ["Social Media", "Friend Recommendation", "Advertisement", "Search Engine", "Other"]}]}',
        true
      )
      ON CONFLICT DO NOTHING
    `);

    console.log('✅ Default survey template created!');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
};

const dropTables = async () => {
  try {
    console.log('🗑️ Dropping all tables...');
    
    await query('DROP TABLE IF EXISTS responses CASCADE');
    await query('DROP TABLE IF EXISTS questions CASCADE');
    await query('DROP TABLE IF EXISTS images CASCADE');
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