module.exports = {
  apps: [{
    name: 'glico-survey-backend',
    script: 'server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      PORT: 5000,
      FRONTEND_URL: 'http://10.200.201.9:3000',
      JWT_SECRET: 'glico-survey-super-secret-jwt-key-2024',
      DATABASE_URL: './glico_survey.db'
    },
    env_production: {
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      PORT: 5000,
      FRONTEND_URL: 'http://10.200.201.9:3000',
      JWT_SECRET: 'glico-survey-super-secret-jwt-key-2024',
      DATABASE_URL: './glico_survey.db'
    }
  }]
};
