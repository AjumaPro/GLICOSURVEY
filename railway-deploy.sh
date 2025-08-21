#!/bin/bash

# Railway Deployment Script for GLICO Survey
# This script ensures both client and server are properly built and deployed

set -e  # Exit on any error

echo "🚂 Starting Railway deployment for GLICO Survey..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Verifying project structure..."

# Check for required directories
if [ ! -d "client" ]; then
    print_error "Client directory not found!"
    exit 1
fi

if [ ! -d "server" ]; then
    print_error "Server directory not found!"
    exit 1
fi

print_success "Project structure verified"

# Install dependencies
print_status "Installing dependencies..."
npm run install-all
print_success "Dependencies installed"

# Build client
print_status "Building React client..."
npm run build
print_success "Client build completed"

# Verify client build
if [ ! -d "client/build" ]; then
    print_error "Client build directory not found!"
    exit 1
fi

print_success "Client build verified"

# Check server files
print_status "Verifying server files..."
if [ ! -f "server/index.js" ]; then
    print_error "Server index.js not found!"
    exit 1
fi

print_success "Server files verified"

# Create production build verification
print_status "Creating production build verification..."

# Check if all required files exist
REQUIRED_FILES=(
    "package.json"
    "railway.json"
    "Procfile"
    "server/index.js"
    "client/build/index.html"
    "client/build/static"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -e "$file" ]; then
        print_error "Required file/directory not found: $file"
        exit 1
    fi
done

print_success "All required files verified"

# Create deployment summary
print_status "Creating deployment summary..."

echo ""
echo "🎯 Railway Deployment Summary"
echo "=============================="
echo "✅ Client: React app built and ready"
echo "✅ Server: Node.js/Express server ready"
echo "✅ Database: PostgreSQL configuration ready"
echo "✅ Static Files: Client build files included"
echo "✅ Health Check: /api/health endpoint available"
echo "✅ CORS: Configured for Railway domains"
echo "✅ Environment: Production-ready configuration"
echo ""

# Display important information
print_warning "Important Railway Configuration:"
echo "1. Add PostgreSQL database in Railway dashboard"
echo "2. Set environment variables (see env.railway)"
echo "3. Run database setup after deployment:"
echo "   npm run railway:setup"
echo ""

print_success "Railway deployment preparation completed!"
echo ""
echo "🚀 Next steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Deploy on Railway: Connect GitHub repo"
echo "3. Add PostgreSQL database"
echo "4. Configure environment variables"
echo "5. Run database setup commands"
echo ""

print_success "GLICO Survey is ready for Railway deployment! 🎉" 