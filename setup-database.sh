#!/bin/bash

# Database Setup Script for GLICO Survey Application

set -e

echo "🗄️ Setting up PostgreSQL database for GLICO Survey Application..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PostgreSQL is running
if ! pg_isready -q; then
    print_error "PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

print_status "PostgreSQL is running"

# Create database user (if it doesn't exist)
print_status "Creating database user..."
sudo -u postgres psql -c "CREATE USER glico_user WITH PASSWORD 'your_secure_password';" 2>/dev/null || print_warning "User glico_user already exists"

# Create database
print_status "Creating database..."
sudo -u postgres psql -c "CREATE DATABASE glico_survey_db OWNER glico_user;" 2>/dev/null || print_warning "Database glico_survey_db already exists"

# Grant privileges
print_status "Granting privileges..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE glico_survey_db TO glico_user;"

# Run database setup
print_status "Running database setup..."
npm run setup-db

# Run migrations
print_status "Running database migrations..."
npm run migrate

# Create admin user
print_status "Creating admin user..."
npm run create-admin

# Create guest user
print_status "Creating guest user..."
npm run create-guest

print_status "Database setup completed successfully!"

echo ""
echo "📋 Database Configuration:"
echo "   - Database: glico_survey_db"
echo "   - User: glico_user"
echo "   - Password: your_secure_password (CHANGE THIS!)"
echo ""
echo "🔐 Admin credentials:"
echo "   - Email: admin@glico.com"
echo "   - Password: admin123"
echo ""
echo "👤 Guest credentials:"
echo "   - Email: guest@glico.com"
echo "   - Password: guest123"
echo "   - Full access to all features"
echo ""
echo "⚠️  IMPORTANT: Change the database password and admin password in production!"
echo "" 