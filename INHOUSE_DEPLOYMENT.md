# In-House Server Deployment Guide

## Prerequisites
- Node.js 18+ installed on your server
- PostgreSQL database running
- PM2 (for process management) - `npm install -g pm2`

## Step 1: Environment Configuration

Create a `.env` file in the root directory with your production settings:

```bash
# Production Environment
NODE_ENV=production
PORT=5000

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/glico_survey_db

# JWT Configuration (CHANGE THIS!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (UPDATE WITH YOUR SERVER DOMAIN)
FRONTEND_URL=http://your-server-ip:3000
# or if using domain: FRONTEND_URL=https://yourdomain.com

# Super Admin Configuration
SUPER_ADMIN_EMAIL=admin@glico.com
SUPER_ADMIN_PASSWORD=admin123
SUPER_ADMIN_NAME=Super Admin
```

## Step 2: Database Setup

```bash
# Connect to your PostgreSQL server
psql -U postgres

# Create database
CREATE DATABASE glico_survey_db;

# Exit psql
\q

# Run database setup
npm run setup-db
npm run migrate
npm run create-admin
```

## Step 3: Build the Application

```bash
# Install dependencies
npm install

# Build the React frontend
npm run build
```

## Step 4: Start the Application

### Option A: Using PM2 (Recommended)

```bash
# Install PM2 globally if not already installed
npm install -g pm2

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### Option B: Direct Start

```bash
# Start in production mode
NODE_ENV=production npm start
```

## Step 5: Configure Reverse Proxy (Optional but Recommended)

If you're using Nginx, add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

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
}
```

## Step 6: Verify Deployment

1. **Check server health:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Test login API:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@glico.com","password":"admin123"}'
   ```

3. **Access the application:**
   - Frontend: `http://your-server-ip:3000` or `http://your-domain.com`
   - Backend API: `http://your-server-ip:5000/api`

## Troubleshooting

### Login Issues

1. **Check if backend is running:**
   ```bash
   pm2 status
   # or
   lsof -i :5000
   ```

2. **Check CORS configuration:**
   - Ensure `FRONTEND_URL` in `.env` matches your actual frontend URL
   - Check browser console for CORS errors

3. **Check database connection:**
   ```bash
   # Test database connection
   psql $DATABASE_URL -c "SELECT 1;"
   ```

4. **Check logs:**
   ```bash
   pm2 logs
   # or
   tail -f logs/app.log
   ```

### Common Issues

1. **Port already in use:**
   ```bash
   lsof -i :5000
   kill -9 <PID>
   ```

2. **Database connection failed:**
   - Check PostgreSQL is running
   - Verify DATABASE_URL format
   - Ensure database exists

3. **Build files not found:**
   ```bash
   npm run build
   ```

## Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Update SUPER_ADMIN_PASSWORD
- [ ] Configure firewall rules
- [ ] Set up SSL/TLS certificates
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging

## Login Credentials

- **Email:** `admin@glico.com`
- **Password:** `admin123` (change this in production!)

## Support

If you encounter issues:
1. Check the logs: `pm2 logs`
2. Verify environment variables
3. Test API endpoints directly
4. Check browser console for errors 