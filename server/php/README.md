# GLICO Survey System - PHP Backend

This is the PHP backend for the GLICO Survey System, designed to work seamlessly with MySQL database and FastAPI integration.

## 🚀 Features

- **RESTful API**: Complete REST API for surveys, templates, users, and analytics
- **MySQL Database**: Robust database design with proper relationships and indexes
- **JWT Authentication**: Secure token-based authentication system
- **Role-based Access Control**: User, Admin, and Super Admin roles
- **File Upload Support**: Secure file upload and management
- **FastAPI Integration**: Python FastAPI bridge for enhanced functionality
- **CORS Support**: Cross-origin resource sharing enabled
- **Security Features**: SQL injection prevention, XSS protection, CSRF protection

## 📋 Requirements

- PHP 8.0 or higher
- MySQL 5.7 or higher
- Composer (PHP package manager)
- Apache/Nginx web server (optional, can use PHP built-in server)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd server/php
```

### 2. Install Dependencies
```bash
composer install
```

### 3. Environment Configuration
```bash
cp env.example .env
# Edit .env file with your database credentials
```

### 4. Database Setup
```bash
# Run the setup script
chmod +x setup_php.sh
./setup_php.sh

# Or manually run the SQL script
mysql -u root -p < database/setup_mysql.sql
```

### 5. Start the Server
```bash
# Using PHP built-in server
php -S localhost:8000 -t .

# Or using Composer
composer start
```

## 🗄️ Database Schema

### Core Tables
- **users**: User accounts and authentication
- **surveys**: Survey definitions and metadata
- **questions**: Individual survey questions
- **responses**: User survey responses
- **survey_templates**: Reusable survey templates
- **uploads**: File upload management
- **analytics**: Survey analytics and metrics
- **sessions**: Survey response sessions

### Key Features
- Soft delete support (is_deleted flag)
- JSON data storage for flexible question options
- Proper foreign key relationships
- Optimized indexes for performance
- Timestamp tracking for all records

## 🔌 API Endpoints

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

## 🔐 Authentication & Security

### JWT Tokens
- Secure token generation and validation
- Configurable expiration time
- Automatic token refresh support

### Role-based Access Control
- **User**: Can create and manage own surveys
- **Admin**: Can manage users and access public surveys
- **Super Admin**: Full system access

### Security Features
- Password hashing with bcrypt
- SQL injection prevention with prepared statements
- XSS protection with proper output encoding
- CORS configuration for cross-origin requests
- File upload validation and security

## 🐍 FastAPI Integration

The system includes a FastAPI integration layer that provides:

- **Python-based API Gateway**: Enhanced request handling
- **Async Support**: Non-blocking request processing
- **Advanced Validation**: Pydantic model validation
- **Documentation**: Auto-generated API documentation
- **Middleware Support**: CORS, authentication, rate limiting

### Running FastAPI
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
python fastapi_integration.py
```

## 📁 File Structure

```
server/php/
├── config/              # Configuration files
│   ├── database.php     # Database connection
│   └── cors.php         # CORS configuration
├── middleware/          # Middleware components
│   └── auth.php         # Authentication middleware
├── routes/              # API route handlers
│   ├── auth.php         # Authentication routes
│   ├── surveys.php      # Survey management
│   ├── templates.php    # Template management
│   ├── admin.php        # Admin functions
│   ├── analytics.php    # Analytics endpoints
│   └── upload.php       # File upload handling
├── database/            # Database scripts
│   └── setup_mysql.sql  # MySQL setup script
├── uploads/             # File upload directory
├── index.php            # Main entry point
├── .htaccess            # Apache configuration
├── composer.json        # PHP dependencies
├── requirements.txt     # Python dependencies
├── fastapi_integration.py # FastAPI integration
└── setup_php.sh         # Setup script
```

## 🧪 Testing

### PHP Tests
```bash
composer test
```

### API Testing
```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@glico.com","password":"admin123"}'
```

## 🔧 Configuration

### Environment Variables
- `DB_HOST`: MySQL host (default: localhost)
- `DB_NAME`: Database name (default: glico_survey)
- `DB_USER`: Database username (default: root)
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: JWT signing secret
- `FRONTEND_URL`: Frontend application URL
- `PHP_BACKEND_URL`: PHP backend URL for FastAPI

### Database Configuration
- Character set: UTF8MB4
- Collation: utf8mb4_unicode_ci
- Timezone: UTC
- Foreign key constraints enabled

## 🚀 Deployment

### Production Considerations
1. **Web Server**: Use Apache/Nginx instead of PHP built-in server
2. **Database**: Use dedicated MySQL server with proper credentials
3. **Security**: Update JWT secret and database passwords
4. **SSL**: Enable HTTPS with proper certificates
5. **Monitoring**: Implement logging and monitoring
6. **Backup**: Regular database and file backups

### Docker Support
```bash
# Build and run with Docker
docker build -t glico-survey-php .
docker run -p 8000:8000 glico-survey-php
```

## 📚 API Documentation

### Request Format
All API requests should include:
- `Content-Type: application/json` header
- `Authorization: Bearer <token>` header for protected endpoints

### Response Format
```json
{
  "status": "success",
  "data": {...},
  "message": "Operation completed successfully"
}
```

### Error Handling
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {...}
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔄 Migration from Node.js

This PHP backend is designed to be a drop-in replacement for the Node.js backend:

1. **Same API Endpoints**: All endpoints maintain the same structure
2. **Data Compatibility**: MySQL schema matches the original data
3. **Authentication**: JWT tokens work seamlessly
4. **Frontend Integration**: No frontend changes required

### Key Differences
- **Database**: MySQL instead of SQLite/PostgreSQL
- **Language**: PHP instead of Node.js
- **Performance**: Optimized for high-traffic scenarios
- **Scalability**: Better horizontal scaling capabilities
