# 🏠 In-House Server Deployment Guide

## 📋 Prerequisites

### Server Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: 20GB+ available space
- **CPU**: 2+ cores
- **Network**: Static IP or domain name

### Software Requirements
- **Node.js**: 18.x or higher
- **PostgreSQL**: 13.x or higher
- **PM2**: Process manager
- **Nginx**: Reverse proxy (optional but recommended)
- **Git**: Version control

## 🚀 Step-by-Step Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx (optional)
sudo apt install nginx -y
```

### 2. Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE surveyguy_db;
CREATE USER surveyguy_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE surveyguy_db TO surveyguy_user;
\q

# Test connection
psql -h localhost -U surveyguy_user -d surveyguy_db
```

### 3. Application Deployment

```bash
# Clone repository
git clone https://github.com/AjumaPro/GLICOSURVEY.git
cd GLICOSURVEY

# Install dependencies
npm run install-all

# Copy production environment
cp env.production .env

# Edit .env with your actual values
nano .env
```

### 4. Environment Configuration

Update `.env` with your actual values:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DATABASE_URL=postgresql://surveyguy_user:your_secure_password@localhost:5432/surveyguy_db

# JWT Configuration (Generate a strong secret)
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-immediately

# Frontend URL (Your server's IP or domain)
FRONTEND_URL=http://your-server-ip:5000
# or FRONTEND_URL=https://your-domain.com

# Super Admin Configuration
SUPER_ADMIN_EMAIL=admin@glico.com
SUPER_ADMIN_PASSWORD=your-secure-admin-password
SUPER_ADMIN_NAME=Super Admin
```

### 5. Database Initialization

```bash
# Setup database tables
npm run setup-db

# Run migrations
npm run migrate

# Create admin user
npm run create-admin
```

### 6. Build and Start Application

```bash
# Build React app
npm run build

# Create logs directory
mkdir -p logs

# Start with PM2
npm run pm2:start

# Check status
npm run pm2:status

# View logs
npm run pm2:logs
```

### 7. Nginx Configuration (Optional but Recommended)

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/glico-survey
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-server-ip your-domain.com;

    # Redirect HTTP to HTTPS (if using SSL)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase upload size limit
    client_max_body_size 10M;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/glico-survey /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. Firewall Configuration

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 5000  # If not using Nginx

# Enable firewall
sudo ufw enable
```

## 🔧 Management Commands

### PM2 Commands
```bash
# Start application
npm run pm2:start

# Stop application
npm run pm2:stop

# Restart application
npm run pm2:restart

# View logs
npm run pm2:logs

# Check status
npm run pm2:status

# Delete application
npm run pm2:delete
```

### Deployment Updates
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm run install-all

# Build and restart
npm run deploy
```

## 🔒 Security Considerations

### 1. Change Default Passwords
- Update admin password after first login
- Use strong, unique passwords
- Consider implementing password policies

### 2. SSL/TLS Certificate
```bash
# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### 3. Regular Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js dependencies
npm audit fix
```

### 4. Backup Strategy
```bash
# Database backup script
#!/bin/bash
pg_dump -h localhost -U surveyguy_user surveyguy_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Application backup
tar -czf app_backup_$(date +%Y%m%d_%H%M%S).tar.gz /path/to/GLICOSURVEY
```

## 📊 Monitoring

### 1. PM2 Monitoring
```bash
# Install PM2 monitoring
pm2 install pm2-server-monit

# View monitoring dashboard
pm2 monit
```

### 2. Log Monitoring
```bash
# View application logs
tail -f logs/combined.log

# View error logs
tail -f logs/err.log
```

### 3. System Monitoring
```bash
# Install htop for system monitoring
sudo apt install htop -y
htop
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
```bash
# Find process using port 5000
sudo lsof -i :5000
# Kill process
sudo kill -9 <PID>
```

2. **Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql
# Restart PostgreSQL
sudo systemctl restart postgresql
```

3. **Permission Issues**
```bash
# Fix file permissions
sudo chown -R $USER:$USER /path/to/GLICOSURVEY
chmod +x /path/to/GLICOSURVEY
```

4. **Memory Issues**
```bash
# Check memory usage
free -h
# Restart application
npm run pm2:restart
```

## 📞 Support

For issues or questions:
1. Check logs: `npm run pm2:logs`
2. Check status: `npm run pm2:status`
3. Restart application: `npm run pm2:restart`
4. Review this guide for common solutions

## 🔄 Maintenance Schedule

### Daily
- Check application logs
- Monitor system resources

### Weekly
- Update system packages
- Review security logs
- Backup database

### Monthly
- Update Node.js dependencies
- Review and rotate secrets
- Performance optimization

---

**🎉 Your GLICO Survey application is now ready for production use on your in-house server!** 