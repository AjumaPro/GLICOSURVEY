# 🚂 Railway.app Deployment Guide

This guide will help you deploy the GLICO Survey application on Railway.app.

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **PostgreSQL Database**: Railway provides PostgreSQL databases

## 🚀 Deployment Steps

### Step 1: Connect to Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your GLICO Survey repository
5. Click "Deploy Now"

### Step 2: Add PostgreSQL Database

1. In your Railway project dashboard, click "New"
2. Select "Database" → "PostgreSQL"
3. Wait for the database to be provisioned
4. Copy the `DATABASE_URL` from the database variables

### Step 3: Configure Environment Variables

In your Railway project dashboard, go to the "Variables" tab and add:

```bash
# Core Configuration
NODE_ENV=production
PORT=5000

# Database (Railway will auto-set this)
DATABASE_URL=postgresql://...

# JWT Configuration (CHANGE THESE!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
SESSION_SECRET=your-session-secret-key-change-this
COOKIE_SECRET=your-cookie-secret-key-change-this

# Frontend URL (Update with your Railway domain)
FRONTEND_URL=https://your-app-name.railway.app

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Super Admin Configuration
SUPER_ADMIN_EMAIL=admin@glico.com
SUPER_ADMIN_PASSWORD=admin123
SUPER_ADMIN_NAME=Super Admin
```

### Step 4: Deploy and Setup Database

1. **Initial Deploy**: Railway will automatically build and deploy your app
2. **Database Setup**: Once deployed, run these commands in Railway's shell:

```bash
# Connect to your Railway app shell
# Go to your project dashboard → Deployments → Latest deployment → View logs → Shell

# Setup database
npm run setup-db

# Run migrations
npm run migrate

# Create admin user
npm run create-admin

# Create guest user
npm run create-guest
```

### Step 5: Verify Deployment

1. **Health Check**: Visit `https://your-app-name.railway.app/api/health`
2. **Application**: Visit `https://your-app-name.railway.app`
3. **Login Test**: Try logging in with:
   - Guest: Click "Login as Guest (All Features)"
   - Admin: `admin@glico.com` / `admin123`

## 🔧 Configuration Files

### railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run install-all && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### package.json Scripts
```json
{
  "scripts": {
    "postinstall": "cd client && npm install",
    "railway:build": "npm run install-all && npm run build",
    "railway:start": "npm run start:prod",
    "start": "node server/index.js",
    "start:prod": "NODE_ENV=production node server/index.js"
  }
}
```

## 🔒 Security Considerations

### Before Production Deployment:

1. **Change Default Passwords**:
   ```bash
   # Update in Railway environment variables
   SUPER_ADMIN_PASSWORD=your-secure-admin-password
   ```

2. **Generate Secure Secrets**:
   ```bash
   # Generate secure JWT secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Generate secure session secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Update Environment Variables**:
   - Replace `JWT_SECRET` with the generated secure secret
   - Replace `SESSION_SECRET` with the generated secure secret
   - Replace `COOKIE_SECRET` with the generated secure secret

## 📊 Monitoring and Logs

### Railway Dashboard Features:
- **Real-time Logs**: View application logs in real-time
- **Metrics**: Monitor CPU, memory, and network usage
- **Deployments**: Track deployment history and rollback if needed
- **Health Checks**: Automatic health monitoring

### Useful Commands:
```bash
# View logs
railway logs

# Connect to shell
railway shell

# Check status
railway status
```

## 🔄 Continuous Deployment

Railway automatically deploys when you push to your main branch:

1. **Push Changes**: `git push origin main`
2. **Auto Deploy**: Railway detects changes and deploys automatically
3. **Health Check**: Railway verifies the deployment is healthy

## 🚨 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Railway build logs
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

2. **Database Connection Issues**:
   - Verify DATABASE_URL is set correctly
   - Check database is provisioned and running
   - Ensure database setup scripts ran successfully

3. **CORS Issues**:
   - Verify FRONTEND_URL is set correctly
   - Check CORS configuration in server/index.js

4. **Port Issues**:
   - Railway sets PORT automatically
   - Ensure your app uses `process.env.PORT`

### Debug Commands:
```bash
# Check environment variables
echo $DATABASE_URL
echo $NODE_ENV

# Test database connection
node -e "require('dotenv').config(); const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT NOW()', (err, res) => { console.log(err || res.rows[0]); pool.end(); });"

# Check application status
curl https://your-app-name.railway.app/api/health
```

## 📈 Scaling

### Railway Scaling Options:
- **Automatic Scaling**: Railway can auto-scale based on traffic
- **Manual Scaling**: Adjust resources in the dashboard
- **Custom Domains**: Add your own domain name

### Performance Optimization:
- **CDN**: Railway provides global CDN for static assets
- **Caching**: Implement Redis for session caching if needed
- **Database**: Consider read replicas for high traffic

## 🎉 Success!

Once deployed, your GLICO Survey application will be available at:
`https://your-app-name.railway.app`

### Default Access:
- **Guest Login**: One-click guest access with full features
- **Admin Login**: `admin@glico.com` / `admin123`
- **Admin Dashboard**: Available for admin users

### Features Available:
- ✅ Survey creation and management
- ✅ Emoji scale questions
- ✅ Real-time analytics
- ✅ Guest access to all surveys
- ✅ Admin dashboard
- ✅ Template management
- ✅ QR code sharing
- ✅ Mobile-responsive design

---

**Need Help?** Check Railway's documentation or contact support through the Railway dashboard. 