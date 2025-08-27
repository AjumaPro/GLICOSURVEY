# 🚀 Deployment Checklist

## ✅ Pre-Deployment Checklist

### **Local Setup**
- [ ] Git repository initialized
- [ ] All changes committed
- [ ] GitHub repository created
- [ ] Code pushed to GitHub

### **Hosting Platform Setup**
- [ ] Hosting account created (Heroku, Vercel, Railway, etc.)
- [ ] New project created
- [ ] GitHub repository connected
- [ ] Initial deployment completed

### **Database Setup**
- [ ] SQLite3 database will be created automatically
- [ ] DATABASE_URL can be left empty for default database file
- [ ] Database setup commands run:
  - [ ] `npm run setup-db`
  - [ ] `npm run migrate`
  - [ ] `npm run create-admin`
  - [ ] `npm run create-guest`

### **Environment Variables**
- [ ] NODE_ENV=production
- [ ] PORT=5000 (or platform default)
- [ ] DATABASE_URL (configured)
- [ ] JWT_SECRET (changed from default)
- [ ] SESSION_SECRET (changed from default)
- [ ] COOKIE_SECRET (changed from default)
- [ ] FRONTEND_URL (updated with your domain)
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
git commit -m "Ready for deployment"
git push origin main

# 2. Deploy to your platform
# (Platform-specific commands)

# 3. Setup database
npm run setup-db
npm run migrate
npm run create-admin
npm run create-guest
```

## 🔧 Environment Variables Template

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=./glico_survey.db
JWT_SECRET=your-secure-jwt-secret
SESSION_SECRET=your-secure-session-secret
COOKIE_SECRET=your-secure-cookie-secret
FRONTEND_URL=https://your-app-domain.com
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

- **Platform Documentation**: Check your hosting platform's docs
- **GitHub Repository**: Your project repository
- **Application Health**: Check your deployed app's health endpoint 