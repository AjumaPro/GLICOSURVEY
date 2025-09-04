#!/bin/bash

# GLICO Survey System - Start Script for In-House Server
# This script starts the application configured for IP 10.200.201.9

echo "🚀 Starting GLICO Survey System for in-house server..."

# Set environment variables
export NODE_ENV=production
export HOST=0.0.0.0
export PORT=5000
export FRONTEND_URL=http://10.200.201.9:3000
export JWT_SECRET=glico-survey-super-secret-jwt-key-2024
export DATABASE_URL=./glico_survey.db

echo "🌐 Server Configuration:"
echo "   - Host: 0.0.0.0 (all interfaces)"
echo "   - Port: 5000"
echo "   - Frontend URL: http://10.200.201.9:3000"
echo "   - Access URL: http://10.200.201.9:5000"
echo ""

# Start the server
echo "🚀 Starting server..."
node server/index.js
