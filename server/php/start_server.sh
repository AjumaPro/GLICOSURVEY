#!/bin/bash

echo "🚀 Starting PHP Backend Server for GLICO Survey System"
echo "====================================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run setup_php.sh first."
    exit 1
fi

# Check if database is accessible
echo "🔍 Testing database connection..."
php -r "
require_once 'config/database.php';
try {
    echo '✅ Database connection successful\n';
} catch (Exception \$e) {
    echo '❌ Database connection failed: ' . \$e->getMessage() . '\n';
    exit(1);
}
"

if [ $? -ne 0 ]; then
    echo "❌ Cannot start server without database connection"
    exit 1
fi

echo "✅ Database connection verified"

# Start PHP built-in server
echo "🌐 Starting PHP server on http://localhost:8000"
echo "📱 Frontend should be running on http://localhost:3000"
echo ""
echo "🔗 API endpoints available at:"
echo "   - http://localhost:8000/api/health"
echo "   - http://localhost:8000/api/auth/login"
echo "   - http://localhost:8000/api/surveys"
echo "   - http://localhost:8000/api/public/surveys"
echo ""
echo "⏹️  Press Ctrl+C to stop the server"
echo ""

# Start the server
php -S localhost:8000 -t . index.php
