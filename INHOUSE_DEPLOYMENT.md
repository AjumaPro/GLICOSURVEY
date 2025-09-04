# GLICO Survey System - In-House Server Deployment Guide

This guide will help you deploy the GLICO Survey System on your in-house server at IP `10.200.201.9`.

## 🚀 Quick Deployment

### Option 1: Automated Deployment (Recommended)
```bash
# Run the automated deployment script
./deploy-inhouse.sh
```

### Option 2: Manual Deployment
```bash
# 1. Install dependencies
npm install
cd client && npm install && cd ..

# 2. Build frontend
npm run build

# 3. Setup database
npm run setup-db

# 4. Create admin user
npm run create-admin

# 5. Start the server
npm run start:inhouse
```

## 🔧 Configuration Details

### Server Configuration
- **Backend Server**: `http://10.200.201.9:5000`
- **Frontend**: `http://10.200.201.9:3000` (development) or served from backend (production)
- **API Endpoint**: `http://10.200.201.9:5000/api`
- **Database**: SQLite (`./glico_survey.db`)

### Environment Variables
The following environment variables are configured for in-house deployment:

```bash
NODE_ENV=production
HOST=10.200.201.9
PORT=5000
FRONTEND_URL=http://10.200.201.9:3000
JWT_SECRET=glico-survey-super-secret-jwt-key-2024
DATABASE_URL=./glico_survey.db
```

## 🌐 Access Points

### Production Access (Recommended)
- **Main Application**: `http://10.200.201.9:5000`
- **API Health Check**: `http://10.200.201.9:5000/api/health`

### Development Access
- **Frontend**: `http://10.200.201.9:3000`
- **Backend API**: `http://10.200.201.9:5000/api`

## 🔑 Default Credentials

### Super Admin
- **Email**: `admin@glico.com`
- **Password**: `admin123`

## 📱 Usage Instructions

### For Survey Creators
1. Navigate to `http://10.200.201.9:5000`
2. Login with admin credentials
3. Create surveys using the survey builder
4. Publish surveys to make them available to respondents

### For Survey Respondents
1. Navigate to `http://10.200.201.9:5000/survey/{survey-id}`
2. Complete the survey
3. Submit responses

## 🔧 Production Management

### Using PM2 (Process Manager)
```bash
# Start with PM2
npm run pm2:start

# Stop PM2 process
npm run pm2:stop

# Restart PM2 process
npm run pm2:restart

# Delete PM2 process
npm run pm2:delete
```

### Manual Process Management
```bash
# Start server
npm run start:inhouse

# Stop server (Ctrl+C)
```

## 🛠️ Troubleshooting

### Port Already in Use
If you get `EADDRINUSE` error:
```bash
# Kill existing processes on port 5000
sudo lsof -ti:5000 | xargs kill -9

# Or use a different port
PORT=5001 npm run start:inhouse
```

### CORS Issues
If you encounter CORS errors:
1. Ensure the frontend URL is correctly set in environment variables
2. Check that the server is binding to the correct IP address
3. Verify firewall settings allow connections on ports 3000 and 5000

### Database Issues
If database errors occur:
```bash
# Reset database
rm glico_survey.db
npm run setup-db
npm run create-admin
```

## 🔒 Security Considerations

### For Production Use
1. **Change Default Passwords**: Update admin credentials
2. **Update JWT Secret**: Change the JWT_SECRET in environment variables
3. **Firewall Configuration**: Restrict access to necessary ports only
4. **SSL/HTTPS**: Consider implementing SSL certificates for secure connections
5. **Regular Backups**: Backup the `glico_survey.db` file regularly

### Network Security
- Ensure only authorized users can access the server
- Consider implementing VPN access for remote users
- Monitor access logs for suspicious activity

## 📊 Monitoring

### Health Check
Monitor server health at: `http://10.200.201.9:5000/api/health`

### Logs
- Server logs are displayed in the console
- For PM2: `pm2 logs glico-survey-backend`

## 🔄 Updates

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
npm run build
npm run pm2:restart
```

### Database Migrations
```bash
# Run database migrations
npm run migrate
```

## 📞 Support

For technical support or issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check network connectivity and firewall settings

## 🎯 Next Steps

After successful deployment:
1. Test all survey functionality
2. Create additional admin users if needed
3. Set up regular database backups
4. Configure monitoring and alerting
5. Train users on the system

---

**Deployment completed successfully!** 🎉

The GLICO Survey System is now running on your in-house server at `http://10.200.201.9:5000`
