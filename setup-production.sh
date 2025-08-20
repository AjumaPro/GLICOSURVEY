#!/bin/bash

# 🏠 GLICO Survey Production Setup Script
# This script automates the deployment of the GLICO Survey application on an in-house server

set -e  # Exit on any error

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

print_status "Starting GLICO Survey production setup..."

# Check if we're in the correct directory
if [ ! -f "package.json" ] || [ ! -f "server/index.js" ]; then
    print_error "Please run this script from the GLICOSURVEY project root directory"
    exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js if not already installed
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    print_status "Node.js is already installed"
fi

# Install PostgreSQL if not already installed
if ! command -v psql &> /dev/null; then
    print_status "Installing PostgreSQL..."
    sudo apt install postgresql postgresql-contrib -y
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
else
    print_status "PostgreSQL is already installed"
fi

# Install PM2 globally if not already installed
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    sudo npm install -g pm2
else
    print_status "PM2 is already installed"
fi

# Install Nginx if not already installed
if ! command -v nginx &> /dev/null; then
    print_status "Installing Nginx..."
    sudo apt install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
else
    print_status "Nginx is already installed"
fi

# Create logs directory
print_status "Creating logs directory..."
mkdir -p logs

# Install application dependencies
print_status "Installing application dependencies..."
npm run install-all

# Check if .env file exists, if not copy from production template
if [ ! -f ".env" ]; then
    print_status "Creating .env file from production template..."
    cp env.production .env
    print_warning "Please edit .env file with your actual configuration values"
    print_warning "Run: nano .env"
    read -p "Press Enter after editing .env file..."
else
    print_status ".env file already exists"
fi

# Setup database
print_status "Setting up database..."
npm run setup-db

# Run migrations
print_status "Running database migrations..."
npm run migrate

# Create admin user
print_status "Creating admin user..."
npm run create-admin

# Build React application
print_status "Building React application..."
npm run build

# Create PM2 ecosystem file if it doesn't exist
if [ ! -f "ecosystem.config.js" ]; then
    print_error "ecosystem.config.js not found. Please ensure it exists."
    exit 1
fi

# Start application with PM2
print_status "Starting application with PM2..."
npm run pm2:start

# Wait a moment for the application to start
sleep 5

# Check if application is running
if pm2 list | grep -q "glico-survey-api"; then
    print_success "Application started successfully!"
else
    print_error "Failed to start application. Check logs with: npm run pm2:logs"
    exit 1
fi

# Configure Nginx
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/glico-survey > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    client_max_body_size 10M;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/glico-survey /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t
sudo systemctl restart nginx

# Configure firewall
print_status "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save
pm2 startup

print_success "🎉 Production setup completed successfully!"
print_status ""
print_status "📋 Next steps:"
print_status "1. Access your application at: http://$(hostname -I | awk '{print $1}')"
print_status "2. Login with admin@glico.com and the password you set"
print_status "3. Change the default admin password"
print_status "4. Configure SSL certificate if needed"
print_status ""
print_status "🔧 Useful commands:"
print_status "- Check status: npm run pm2:status"
print_status "- View logs: npm run pm2:logs"
print_status "- Restart app: npm run pm2:restart"
print_status "- Stop app: npm run pm2:stop"
print_status ""
print_status "📚 For more information, see: deployment-guide.md" 