#!/bin/bash

# GLICO Survey System - In-House Server Deployment Script
# This script deploys the application to run on IP 10.200.201.9

echo "🚀 Starting GLICO Survey System deployment for in-house server..."

# Set environment variables for in-house deployment
export NODE_ENV=production
export HOST=0.0.0.0
export PORT=5000
export FRONTEND_URL=http://10.200.201.9:3000
export JWT_SECRET=glico-survey-super-secret-jwt-key-2024

echo "📦 Installing dependencies..."
npm install

echo "🔧 Installing client dependencies..."
cd client && npm install && cd ..

echo "🏗️ Building frontend for production..."
npm run build

echo "🗄️ Setting up database..."
npm run setup-db

echo "👤 Creating admin user..."
npm run create-admin

echo "✅ Deployment completed!"
echo ""
echo "🌐 Server Configuration:"
echo "   - Backend: http://10.200.201.9:5000"
echo "   - Frontend: http://10.200.201.9:3000"
echo "   - API: http://10.200.201.9:5000/api"
echo ""
echo "🚀 To start the server, run:"
echo "   npm run start:inhouse"
echo ""
echo "📱 Access the application at:"
echo "   http://10.200.201.9:5000"
echo ""
echo "🔑 Default admin credentials:"
echo "   Email: admin@glico.com"
echo "   Password: admin123"
