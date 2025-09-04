#!/bin/bash

echo "🚀 Setting up PHP Backend with MySQL for GLICO Survey System"
echo "=========================================================="

# Check if PHP is installed
if ! command -v php &> /dev/null; then
    echo "❌ PHP is not installed. Please install PHP 8.0+ first."
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    exit 1
fi

# Check if Composer is installed
if ! command -v composer &> /dev/null; then
    echo "❌ Composer is not installed. Please install Composer first."
    exit 1
fi

echo "✅ PHP, MySQL, and Composer are installed"

# Create .env file from example
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please update the database credentials."
else
    echo "✅ .env file already exists"
fi

# Create uploads directory
if [ ! -d uploads ]; then
    echo "📁 Creating uploads directory..."
    mkdir -p uploads
    chmod 755 uploads
    echo "✅ Uploads directory created"
else
    echo "✅ Uploads directory already exists"
fi

# Install PHP dependencies
echo "📦 Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader

# Setup MySQL database
echo "🗄️  Setting up MySQL database..."
read -p "Enter MySQL root password (leave empty if none): " mysql_password

if [ -z "$mysql_password" ]; then
    mysql -u root < database/setup_mysql.sql
else
    mysql -u root -p"$mysql_password" < database/setup_mysql.sql
fi

if [ $? -eq 0 ]; then
    echo "✅ Database setup completed successfully"
else
    echo "❌ Database setup failed. Please check your MySQL credentials."
    exit 1
fi

# Test database connection
echo "🔍 Testing database connection..."
php -r "
require_once 'config/database.php';
try {
    \$pdo = new PDO('mysql:host=localhost;dbname=glico_survey', 'root', '$mysql_password');
    echo '✅ Database connection successful\n';
} catch (PDOException \$e) {
    echo '❌ Database connection failed: ' . \$e->getMessage() . '\n';
    exit(1);
}
"

# Create admin user with proper password hash
echo "👤 Creating admin user..."
php -r "
require_once 'config/database.php';
\$password = 'admin123';
\$hash = password_hash(\$password, PASSWORD_DEFAULT);
\$sql = 'UPDATE users SET password_hash = ? WHERE email = ?';
\$stmt = \$pdo->prepare(\$sql);
\$stmt->execute([\$hash, 'admin@glico.com']);
echo '✅ Admin user password updated\n';
echo '📧 Email: admin@glico.com\n';
echo '🔑 Password: admin123\n';
"

echo ""
echo "🎉 PHP Backend setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env file with your database credentials"
echo "2. Start PHP server: php -S localhost:8000 -t ."
echo "3. Or use Apache/Nginx with the provided .htaccess"
echo "4. Test the API endpoints"
echo ""
echo "🔗 API endpoints will be available at:"
echo "   - Health check: http://localhost:8000/api/health"
echo "   - Login: http://localhost:8000/api/auth/login"
echo "   - Surveys: http://localhost:8000/api/surveys"
echo ""
echo "📚 For FastAPI integration, see fastapi_integration.py"
