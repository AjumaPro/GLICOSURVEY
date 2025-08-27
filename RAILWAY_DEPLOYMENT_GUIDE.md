# 🚂 Railway Deployment Guide for GLICO Survey

This comprehensive guide will help you deploy your GLICO Survey application on Railway with both frontend and backend.

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Node.js**: Version 18+ (Railway will handle this)
4. **PostgreSQL**: Railway provides PostgreSQL databases

## 🚀 Step-by-Step Deployment

### **Step 1: Prepare Your Local Repository**

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit for Railway deployment"

# Create GitHub repository and push
# Go to GitHub.com → New Repository → Create
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### **Step 2: Deploy to Railway**

#### **Option A: Using Railway Dashboard (Recommended)**

1. **Go to Railway**: Visit [railway.app](https://railway.app) and sign in
2. **Create New Project**: Click "New Project"
3. **Connect GitHub**: Select "Deploy from GitHub repo"
4. **Choose Repository**: Select your GLICO Survey repository
5. **Deploy**: Click "Deploy Now"

#### **Option B: Using Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link your project
railway link

# Deploy
railway up
```

### **Step 3: Add PostgreSQL Database**

1. **In Railway Dashboard**: Go to your project
2. **Add Service**: Click "New" → "Database" → "PostgreSQL"
3. **Wait for Provisioning**: Railway will create the database
4. **Copy Connection String**: Note the `DATABASE_URL` from the database variables

### **Step 4: Configure Environment Variables**

In your Railway project dashboard, go to the "Variables" tab and add:

```bash
# Core Configuration
NODE_ENV=production
PORT=5000

# Database (Railway will auto-set this from PostgreSQL service)
DATABASE_URL=postgresql://...

# JWT Configuration (CHANGE THESE FOR PRODUCTION!)
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

# Firebase Configuration (if using Firebase)
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=your-firebase-app-id
```

### **Step 5: Setup Database**

Once your app is deployed, you need to setup the database. Go to Railway dashboard:

1. **Open Shell**: Go to your project → Deployments → Latest deployment → View logs → Shell
2. **Run Setup Commands**:

```bash
# Setup database tables
npm run setup-db

# Run migrations
npm run migrate

# Create admin user
npm run create-admin

# Create guest user
npm run create-guest

# Create platinum banking template (optional)
npm run create-platinum-template
```

### **Step 6: Verify Deployment**

1. **Health Check**: Visit `https://your-app-name.railway.app/api/health`
2. **Application**: Visit `https://your-app-name.railway.app`
3. **Login Test**: Try logging in with:
   - **Guest**: Click "Login as Guest (All Features)"
   - **Admin**: `admin@glico.com` / `admin123`

## 🔧 Configuration Files

### **railway.json** (Already configured)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run install-all && npm run build && npm run build:server"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### **package.json Scripts** (Already configured)
```json
{
  "scripts": {
    "railway:build": "npm run install-all && npm run build",
    "railway:start": "npm run start:prod",
    "railway:setup": "npm run setup-db && npm run migrate && npm run create-admin && npm run create-guest"
  }
}
```

## 🌐 Domain Configuration

### **Custom Domain (Optional)**
1. **In Railway Dashboard**: Go to your project → Settings → Domains
2. **Add Custom Domain**: Enter your domain name
3. **Configure DNS**: Update your DNS records as instructed by Railway
4. **Update FRONTEND_URL**: Update the environment variable with your custom domain

## 🔒 Security Considerations

### **Environment Variables to Change**
- `JWT_SECRET`: Generate a strong random string
- `SESSION_SECRET`: Generate a strong random string
- `COOKIE_SECRET`: Generate a strong random string
- `SUPER_ADMIN_PASSWORD`: Change from default `admin123`

### **Generate Secure Secrets**
```bash
# Generate secure secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📊 Monitoring and Logs

### **View Logs**
- **Railway Dashboard**: Go to your project → Deployments → View logs
- **Railway CLI**: `railway logs`

### **Health Monitoring**
- **Health Check**: `https://your-app-name.railway.app/api/health`
- **Status**: Railway automatically monitors your app health

## 🔄 Continuous Deployment

### **Automatic Deployments**
Railway automatically deploys when you push to your main branch:
```bash
git add .
git commit -m "Update app"
git push origin main
```

### **Manual Deployments**
```bash
# Using Railway CLI
railway up

# Using Railway Dashboard
# Go to your project → Deployments → Deploy Now
```

## 🛠️ Troubleshooting

### **Common Issues**

1. **Build Failures**
   - Check Railway logs for build errors
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

2. **Database Connection Issues**
   - Verify DATABASE_URL is set correctly
   - Check if PostgreSQL service is running
   - Ensure database setup commands were run

3. **Frontend Not Loading**
   - Check if client build completed successfully
   - Verify FRONTEND_URL environment variable
   - Check CORS configuration

4. **API Endpoints Not Working**
   - Verify backend is running on correct port
   - Check environment variables
   - Review server logs

### **Debug Commands**
```bash
# Check Railway status
railway status

# View logs
railway logs

# Connect to shell
railway shell

# Check environment variables
railway variables
```

## 📈 Scaling

### **Railway Plans**
- **Free Tier**: Limited resources, good for development
- **Pro Plan**: More resources, custom domains, team collaboration
- **Enterprise**: Advanced features, dedicated support

### **Performance Optimization**
- Enable caching where appropriate
- Optimize database queries
- Use CDN for static assets
- Monitor resource usage

## 🎉 Success Checklist

- [ ] Repository pushed to GitHub
- [ ] Railway project created and deployed
- [ ] PostgreSQL database added
- [ ] Environment variables configured
- [ ] Database setup commands executed
- [ ] Health check endpoint responding
- [ ] Frontend loading correctly
- [ ] Admin user created and can login
- [ ] Guest user can access features
- [ ] Custom domain configured (optional)

## 📞 Support

- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **GitHub Issues**: Create issues in your repository

---

**🎉 Congratulations! Your GLICO Survey app is now deployed on Railway!** 