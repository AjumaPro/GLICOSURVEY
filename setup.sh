#!/bin/bash

echo "🚀 Setting up SurveyGuy - Comprehensive Survey Platform"
echo "========================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install server dependencies
echo "📦 Installing server dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your configuration before starting the application"
fi

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p server/uploads

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration:"
echo "   - DATABASE_URL: Your PostgreSQL connection string"
echo "   - JWT_SECRET: A secure random string for JWT tokens"
echo "   - FIREBASE_CONFIG: Your Firebase configuration (optional for now)"
echo ""
echo "2. Set up your PostgreSQL database and run:"
echo "   npm run setup-db"
echo ""
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For more information, check the README.md file" 
 