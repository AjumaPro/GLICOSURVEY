# 🚂 Railway Deployment Checklist

## ✅ Pre-Deployment Checklist

### **Local Setup**
- [ ] Git repository initialized
- [ ] All changes committed
- [ ] GitHub repository created
- [ ] Code pushed to GitHub

### **Railway Setup**
- [ ] Railway account created
- [ ] New project created
- [ ] GitHub repository connected
- [ ] Initial deployment completed

### **Database Setup**
- [ ] PostgreSQL service added
- [ ] DATABASE_URL copied from Railway
- [ ] Database setup commands run:
  - [ ] `npm run setup-db`
  - [ ] `npm run migrate`
  - [ ] `npm run create-admin`
  - [ ] `npm run create-guest`

### **Environment Variables**
- [ ] NODE_ENV=production
- [ ] PORT=5000
- [ ] DATABASE_URL (auto-set by Railway)
- [ ] JWT_SECRET (changed from default)
- [ ] SESSION_SECRET (changed from default)
- [ ] COOKIE_SECRET (changed from default)
- [ ] FRONTEND_URL (updated with Railway domain)
- [ ] LOG_LEVEL=info
- [ ] RATE_LIMIT_WINDOW_MS=900000
- [ ] RATE_LIMIT_MAX_REQUESTS=100
- [ ] MAX_FILE_SIZE=10485760
- [ ] UPLOAD_PATH=./uploads
- [ ] SUPER_ADMIN_EMAIL=admin@glico.com
- [ ] SUPER_ADMIN_PASSWORD (changed from default)
- [ ] SUPER_ADMIN_NAME=Super Admin

### **Verification**
- [ ] Health check endpoint working: `/api/health`
- [ ] Frontend loading correctly
- [ ] Admin login working: admin@glico.com / admin123
- [ ] Guest login working
- [ ] Survey creation working
- [ ] Survey responses working
- [ ] Analytics dashboard working

## 🚀 Quick Deploy Commands

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for Railway deployment"
git push origin main

# 2. Deploy to Railway (if using CLI)
railway up

# 3. Setup database (in Railway shell)
npm run setup-db
npm run migrate
npm run create-admin
npm run create-guest
```

## 🔧 Environment Variables Template

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=your-secure-jwt-secret
SESSION_SECRET=your-secure-session-secret
COOKIE_SECRET=your-secure-cookie-secret
FRONTEND_URL=https://your-app-name.railway.app
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
SUPER_ADMIN_EMAIL=admin@glico.com
SUPER_ADMIN_PASSWORD=your-secure-password
SUPER_ADMIN_NAME=Super Admin
```

## 📞 Support Links

- **Railway Dashboard**: https://railway.app
- **Railway Documentation**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway 