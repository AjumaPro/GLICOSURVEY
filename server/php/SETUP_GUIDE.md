# 🚀 PHP Backend Setup Guide for GLICO Survey System

This guide will help you set up the PHP backend with MySQL to replace the Node.js backend.

## 📋 Prerequisites

- PHP 8.0 or higher
- MySQL 8.0 or higher
- Composer (PHP package manager)
- Git

## 🔧 Step-by-Step Setup

### 1. Install Dependencies

```bash
# Navigate to the PHP backend directory
cd server/php

# Install PHP dependencies
composer install --no-dev --optimize-autoloader
```

### 2. Database Setup

```bash
# Create MySQL database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS glico_survey;"

# Run the setup script
./setup_php.sh
```

### 3. Environment Configuration

Create a `.env` file in the `server/php` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_NAME=glico_survey
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Application Configuration
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Test the Backend

```bash
# Test the API endpoints
php test_api.php

# Start the PHP server
./start_server.sh
```

The server will start on `http://localhost:8000`

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/register` - Register new user (admin only)

### Surveys
- `GET /api/surveys` - List all surveys
- `GET /api/surveys/{id}` - Get specific survey
- `POST /api/surveys` - Create new survey
- `PUT /api/surveys/{id}` - Update survey
- `DELETE /api/surveys/{id}` - Delete survey
- `POST /api/surveys/{id}/publish` - Publish survey
- `POST /api/surveys/{id}/unpublish` - Unpublish survey
- `POST /api/surveys/{id}/duplicate` - Duplicate survey
- `POST /api/surveys/{id}/copy` - Copy survey

### Templates
- `GET /api/templates` - List all templates
- `GET /api/templates/{id}` - Get specific template
- `POST /api/templates` - Create new template
- `PUT /api/templates/{id}` - Update template
- `DELETE /api/templates/{id}` - Delete template

### Questions
- `GET /api/questions` - List questions for a survey
- `GET /api/questions/{id}` - Get specific question
- `POST /api/questions` - Create new question
- `PUT /api/questions/{id}` - Update question
- `DELETE /api/questions/{id}` - Delete question

### Responses
- `GET /api/responses` - List all responses
- `GET /api/responses/{id}` - Get specific response
- `POST /api/responses` - Create new response
- `DELETE /api/responses/{id}` - Delete response

### Tasks
- `GET /api/tasks` - List all tasks
- `GET /api/tasks/{id}` - Get specific task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Users
- `GET /api/users` - List all users (admin only)
- `GET /api/users/{id}` - Get specific user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user (admin only)

### Admin
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user

### Analytics
- `GET /api/analytics` - Basic analytics
- `GET /api/analytics/dashboard` - Dashboard data
- `GET /api/analytics/{survey_id}` - Survey-specific analytics

### File Upload
- `POST /api/upload` - Upload file
- `GET /api/upload/{filename}` - Download file
- `DELETE /api/upload/{filename}` - Delete file

### Public (No Authentication Required)
- `GET /api/public/surveys` - List public surveys
- `GET /api/public/surveys/{id}` - Get public survey
- `POST /api/public/surveys/{id}/submit` - Submit survey responses

## 🔄 Migration from SQLite

If you have existing data in SQLite:

```bash
# Run the migration script
php migrate_from_sqlite.php
```

This will transfer all your surveys, templates, and responses to MySQL.

## 🚀 Starting the System

### 1. Start PHP Backend
```bash
cd server/php
./start_server.sh
```

### 2. Start Frontend (in a new terminal)
```bash
cd client
npm start
```

The frontend will proxy API requests to `http://localhost:8000` (the PHP backend).

## 🧪 Testing

### Test Health Endpoint
```bash
curl http://localhost:8000/api/health
```

### Test Authentication
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@glico.com","password":"admin123"}'
```

### Test Survey Creation
```bash
curl -X POST http://localhost:8000/api/surveys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Test Survey","description":"Test Description","questions":[]}'
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **Permission Denied**
   - Check file permissions on startup scripts
   - Ensure PHP has access to the directory

3. **Frontend Still Using Old Backend**
   - Verify `client/package.json` has `"proxy": "http://localhost:8000"`
   - Restart the frontend after changing proxy
   - Check browser network tab for API calls

4. **JWT Token Issues**
   - Verify `JWT_SECRET` is set in `.env`
   - Check token expiration
   - Ensure proper Authorization header format

### Logs

Check the PHP server output for error messages and API request logs.

## 📚 Additional Resources

- [PHP Documentation](https://www.php.net/docs.php)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Composer Documentation](https://getcomposer.org/doc/)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check the PHP server logs
4. Test individual API endpoints with curl
5. Ensure database schema is correct

---

**Happy Survey Building! 🎉**
