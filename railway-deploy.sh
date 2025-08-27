#!/bin/bash

# 🚂 Railway Deployment Script for GLICO Survey
# This script helps you deploy your app to Railway

echo "🚂 GLICO Survey Railway Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_error "Git repository not initialized. Please run: git init"
    exit 1
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Please commit them first:"
    echo "  git add ."
    echo "  git commit -m 'Your commit message'"
    exit 1
fi

print_status "Starting Railway deployment process..."

# Step 1: Build the application
print_status "Step 1: Building the application..."
npm run build:full

if [ $? -eq 0 ]; then
    print_success "Build completed successfully!"
else
    print_error "Build failed. Please check the errors above."
    exit 1
fi

# Step 2: Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    print_warning "Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Step 3: Login to Railway (if not already logged in)
print_status "Step 2: Checking Railway login status..."
if ! railway whoami &> /dev/null; then
    print_status "Please login to Railway..."
    railway login
fi

# Step 4: Link to Railway project (if not already linked)
if [ ! -f ".railway" ]; then
    print_status "Step 3: Linking to Railway project..."
    railway link
fi

# Step 5: Deploy to Railway
print_status "Step 4: Deploying to Railway..."
railway up

if [ $? -eq 0 ]; then
    print_success "Deployment completed successfully!"
    
    # Get the deployment URL
    DEPLOY_URL=$(railway status --json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$DEPLOY_URL" ]; then
        print_success "Your app is deployed at: $DEPLOY_URL"
        print_status "API Health Check: $DEPLOY_URL/api/health"
    fi
    
    print_status "Next steps:"
    echo "1. Go to Railway dashboard to configure environment variables"
    echo "2. Add PostgreSQL database service"
    echo "3. Run database setup commands in Railway shell:"
    echo "   - npm run setup-db"
    echo "   - npm run migrate"
    echo "   - npm run create-admin"
    echo "   - npm run create-guest"
    
else
    print_error "Deployment failed. Please check the errors above."
    exit 1
fi

print_success "Railway deployment script completed!" 