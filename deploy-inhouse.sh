#!/bin/bash

# GLICO Survey Application - In-House Server Deployment Script
# This script sets up the application for production deployment

set -e  # Exit on any error

echo "🚀 Starting GLICO Survey Application Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check prerequisites
print_status "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version: $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed."
    exit 1
fi

print_status "npm version: $(npm -v)"

# Check PM2
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 is not installed. Installing PM2..."
    npm install -g pm2
fi

print_status "PM2 version: $(pm2 -v)"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

print_status "PostgreSQL is installed"

# Check Nginx
if ! command -v nginx &> /dev/null; then
    print_warning "Nginx is not installed. Please install Nginx first."
    print_status "On Ubuntu/Debian: sudo apt-get install nginx"
    print_status "On CentOS/RHEL: sudo yum install nginx"
    exit 1
fi

print_status "Nginx is installed"

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p /var/www/glico-survey

# Install dependencies
print_status "Installing Node.js dependencies..."
npm install

# Install client dependencies
print_status "Installing React client dependencies..."
cd client
npm install
cd ..

# Build the application
print_status "Building React application..."
npm run build

# Copy build files to web directory
print_status "Copying build files to web directory..."
sudo cp -r client/build/* /var/www/glico-survey/

# Set proper permissions
print_status "Setting proper permissions..."
sudo chown -R www-data:www-data /var/www/glico-survey
sudo chmod -R 755 /var/www/glico-survey

# Setup environment file
print_status "Setting up environment configuration..."
if [ ! -f .env ]; then
    cp env.production .env
    print_warning "Please edit .env file with your actual configuration values"
    print_warning "Important: Change JWT_SECRET and database credentials!"
else
    print_status ".env file already exists"
fi

# Setup Nginx configuration
print_status "Setting up Nginx configuration..."
sudo cp nginx.conf /etc/nginx/sites-available/glico-survey

# Create symlink
if [ ! -L /etc/nginx/sites-enabled/glico-survey ]; then
    sudo ln -s /etc/nginx/sites-available/glico-survey /etc/nginx/sites-enabled/
fi

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    print_status "Nginx configuration is valid"
else
    print_error "Nginx configuration is invalid. Please check the configuration."
    exit 1
fi

# Restart Nginx
print_status "Restarting Nginx..."
sudo systemctl restart nginx

# Setup PM2
print_status "Setting up PM2 process manager..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

print_status "PM2 startup command generated. Please run the command above as root."

# Create systemd service (alternative to PM2)
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/glico-survey.service > /dev/null <<EOF
[Unit]
Description=GLICO Survey Application
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable glico-survey

print_status "Deployment completed successfully!"

echo ""
echo "🎉 GLICO Survey Application is now deployed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your actual configuration:"
echo "   - Update DATABASE_URL with your PostgreSQL credentials"
echo "   - Change JWT_SECRET to a secure random string"
echo "   - Update FRONTEND_URL with your server domain/IP"
echo ""
echo "2. Set up your database:"
echo "   - Create PostgreSQL database: glico_survey_db"
echo "   - Run: npm run setup-db"
echo "   - Run: npm run migrate"
echo "   - Run: npm run create-admin"
echo "   - Run: npm run create-guest"
echo ""
echo "3. Update Nginx configuration:"
echo "   - Edit /etc/nginx/sites-available/glico-survey"
echo "   - Replace 'your-server-domain.com' with your actual domain"
echo ""
echo "4. Start the application:"
echo "   - PM2: pm2 start ecosystem.config.js --env production"
echo "   - Or systemd: sudo systemctl start glico-survey"
echo ""
echo "5. Access the application:"
echo "   - Frontend: http://your-server-domain.com"
echo "   - API: http://your-server-domain.com/api"
echo "   - Health check: http://your-server-domain.com/health"
echo ""
echo "🔐 Default admin credentials:"
echo "   - Email: admin@glico.com"
echo "   - Password: admin123"
echo "   - IMPORTANT: Change this password immediately!"
echo ""
echo "👤 Guest account credentials:"
echo "   - Email: guest@glico.com"
echo "   - Password: guest123"
echo "   - Full access to all features"
echo ""
echo "📝 Logs:"
echo "   - Application logs: pm2 logs glico-survey-api"
echo "   - Nginx logs: sudo tail -f /var/log/nginx/access.log"
echo "   - Error logs: sudo tail -f /var/log/nginx/error.log"
echo "" 