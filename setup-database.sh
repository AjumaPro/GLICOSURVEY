#!/bin/bash

# Database Setup Script for GLICO Survey Application (SQLite3)

set -e

echo "🗄️ Setting up SQLite3 database for GLICO Survey Application..."

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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

print_status "Node.js is available"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "npm is available"

# Install dependencies
print_status "Installing dependencies..."
npm install

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
echo "   - Database: glico_survey.db (SQLite3)"
echo "   - Location: ./glico_survey.db"
echo "   - No additional setup required"
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
echo "⚠️  IMPORTANT: Change the admin password in production!"
echo ""
echo "🚀 To start the application:"
echo "   npm run dev" 