// Server Configuration for In-House Deployment
// Copy this to .env file for production use

module.exports = {
  // Application Configuration
  NODE_ENV: 'production',
  PORT: 5000,
  HOST: '10.200.201.9',

  // Database Configuration
  DATABASE_URL: './glico_survey.db',

  // JWT Configuration
  JWT_SECRET: 'glico-survey-super-secret-jwt-key-2024',

  // Frontend URL (for CORS)
  FRONTEND_URL: 'http://10.200.201.9:3000',

  // Logging
  LOG_LEVEL: 'info',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 900000,
  RATE_LIMIT_MAX_REQUESTS: 100,

  // Security
  SESSION_SECRET: 'glico-survey-session-secret-2024',
  COOKIE_SECRET: 'glico-survey-cookie-secret-2024',

  // File Upload
  MAX_FILE_SIZE: 10485760,
  UPLOAD_PATH: './uploads',

  // Super Admin Configuration
  SUPER_ADMIN_EMAIL: 'admin@glico.com',
  SUPER_ADMIN_PASSWORD: 'admin123',
  SUPER_ADMIN_NAME: 'Super Admin'
};
