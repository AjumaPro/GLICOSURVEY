# In-House Server Deployment Guide

## Prerequisites
- Ubuntu/Debian or CentOS/RHEL server
- Node.js 18+ installed
- PostgreSQL 12+ installed and running
- Nginx installed
- PM2 (for process management) - `npm install -g pm2`

## Quick Deployment

### Option 1: Automated Deployment (Recommended)
```bash
# Clone the repository
git clone https://github.com/AjumaPro/GLICOSURVEY.git
cd GLICOSURVEY

# Run the automated deployment script
./deploy-inhouse.sh
```

### Option 2: Manual Deployment

## Step 1: Environment Configuration

Create a `.env` file in the root directory:

```bash
# Production Environment
NODE_ENV=production
PORT=5000

# Database Configuration
DATABASE_URL=postgresql://glico_user:your_secure_password@localhost:5432/glico_survey_db

# JWT Configuration (CHANGE THIS!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024

# Frontend URL (UPDATE WITH YOUR SERVER DOMAIN)
FRONTEND_URL=http://your-server-domain.com
# or if using IP: FRONTEND_URL=http://your-server-ip

# Super Admin Configuration
SUPER_ADMIN_EMAIL=admin@glico.com
SUPER_ADMIN_PASSWORD=admin123
SUPER_ADMIN_NAME=Super Admin
```

## Step 2: Database Setup

```bash
# Run the database setup script
./setup-database.sh

# Or manually:
# Create database user
sudo -u postgres psql -c "CREATE USER glico_user WITH PASSWORD 'your_secure_password';"

# Create database
sudo -u postgres psql -c "CREATE DATABASE glico_survey_db OWNER glico_user;"

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE glico_survey_db TO glico_user;"

# Setup database schema
npm run setup-db
npm run migrate
npm run create-admin
```

## Step 3: Build and Deploy

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Build the React frontend
npm run build

# Copy build files to web directory
sudo mkdir -p /var/www/glico-survey
sudo cp -r client/build/* /var/www/glico-survey/
sudo chown -R www-data:www-data /var/www/glico-survey
sudo chmod -R 755 /var/www/glico-survey
```

## Step 4: Nginx Configuration

```bash
# Copy Nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/glico-survey

# Edit the configuration with your domain
sudo nano /etc/nginx/sites-available/glico-survey

# Create symlink
sudo ln -s /etc/nginx/sites-available/glico-survey /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

**Important:** Update the `server_name` in `nginx.conf` with your actual domain or IP address.

## Step 5: Start the Application

### Using PM2 (Recommended)
```bash
# Start the application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command that PM2 provides
```

### Using Systemd
```bash
# Enable and start the service
sudo systemctl enable glico-survey
sudo systemctl start glico-survey
```

## Step 6: Verify Deployment

1. **Check application health:**
   ```bash
   curl http://your-server-domain.com/health
   ```

2. **Test login API:**
   ```bash
   curl -X POST http://your-server-domain.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@glico.com","password":"admin123"}'
   ```

3. **Access the application:**
   - Frontend: `http://your-server-domain.com`
   - API: `http://your-server-domain.com/api`

## Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Update database password
- [ ] Change admin password
- [ ] Configure firewall rules
- [ ] Set up SSL/TLS certificates
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging

## Firewall Configuration

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow SSH (if needed)
sudo ufw allow 22

# Enable firewall
sudo ufw enable
```

## SSL/TLS Setup (Optional but Recommended)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Logs

### Application Logs
```bash
# PM2 logs
pm2 logs glico-survey-api

# Systemd logs
sudo journalctl -u glico-survey -f
```

### Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Database Logs
```bash
# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   lsof -i :5000
   kill -9 <PID>
   ```

2. **Database connection failed:**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Test connection
   psql -h localhost -U glico_user -d glico_survey_db
   ```

3. **Nginx configuration errors:**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

4. **Permission issues:**
   ```bash
   sudo chown -R www-data:www-data /var/www/glico-survey
   sudo chmod -R 755 /var/www/glico-survey
   ```

### Performance Optimization

1. **Enable Nginx caching:**
   ```nginx
   # Add to nginx.conf
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

2. **Enable Gzip compression:**
   ```nginx
   # Already included in nginx.conf
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

3. **Database optimization:**
   ```sql
   -- Add indexes for better performance
   CREATE INDEX idx_surveys_user_id ON surveys(user_id);
   CREATE INDEX idx_responses_survey_id ON responses(survey_id);
   ```

## Login Credentials

- **Email:** `admin@glico.com`
- **Password:** `admin123` (change this in production!)

## Support

If you encounter issues:
1. Check the logs: `pm2 logs` or `sudo journalctl -u glico-survey`
2. Verify environment variables in `.env`
3. Test API endpoints directly
4. Check browser console for errors
5. Verify Nginx configuration: `sudo nginx -t` 