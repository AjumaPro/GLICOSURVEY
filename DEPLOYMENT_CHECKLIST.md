# GLICO Survey System - In-House Deployment Checklist

## ✅ Pre-Deployment Checklist

### Server Requirements
- [ ] Server with IP `10.200.201.9` is available
- [ ] Node.js 18+ installed on server
- [ ] npm installed on server
- [ ] Ports 3000 and 5000 are open in firewall
- [ ] Server has internet access for initial setup

### Network Configuration
- [ ] Server IP `10.200.201.9` is accessible from client machines
- [ ] DNS resolution works (if using domain names)
- [ ] Firewall allows HTTP traffic on ports 3000 and 5000

## 🚀 Deployment Steps

### 1. Transfer Files to Server
```bash
# Copy the entire project to the server
scp -r /path/to/GLICOSURVEY-main user@10.200.201.9:/path/to/deployment/
```

### 2. Install Dependencies
```bash
# On the server
cd /path/to/GLICOSURVEY-main
npm install
cd client && npm install && cd ..
```

### 3. Build Frontend
```bash
npm run build
```

### 4. Setup Database
```bash
npm run setup-db
```

### 5. Create Admin User
```bash
npm run create-admin
```

### 6. Start the Application
```bash
# Option 1: Direct start
./start-inhouse.sh

# Option 2: Using npm script
npm run start:inhouse

# Option 3: Using PM2 (recommended for production)
npm run pm2:start
```

## 🔧 Configuration Files

### Environment Variables
The following environment variables are configured:
- `NODE_ENV=production`
- `HOST=0.0.0.0` (binds to all interfaces)
- `PORT=5000`
- `FRONTEND_URL=http://10.200.201.9:3000`
- `JWT_SECRET=glico-survey-super-secret-jwt-key-2024`

### CORS Configuration
- Frontend URL: `http://10.200.201.9:3000`
- Backend API: `http://10.200.201.9:5000`

## 🌐 Access Points

### Production Access
- **Main Application**: `http://10.200.201.9:5000`
- **API Health Check**: `http://10.200.201.9:5000/api/health`

### Development Access (if needed)
- **Frontend**: `http://10.200.201.9:3000`
- **Backend API**: `http://10.200.201.9:5000/api`

## 🔑 Default Credentials

### Super Admin
- **Email**: `admin@glico.com`
- **Password**: `admin123`

## ✅ Post-Deployment Verification

### 1. Health Check
```bash
curl http://10.200.201.9:5000/api/health
```
Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "production"
}
```

### 2. Frontend Access
- [ ] Navigate to `http://10.200.201.9:5000`
- [ ] Login page loads correctly
- [ ] Can login with admin credentials
- [ ] Dashboard loads correctly

### 3. Survey Functionality
- [ ] Can create new surveys
- [ ] Can add questions of all types
- [ ] Can publish surveys
- [ ] Can access published surveys
- [ ] Can submit survey responses

### 4. API Endpoints
- [ ] Authentication works
- [ ] Survey CRUD operations work
- [ ] Response submission works
- [ ] Analytics data loads

## 🔒 Security Checklist

### Production Security
- [ ] Change default admin password
- [ ] Update JWT secret key
- [ ] Configure firewall rules
- [ ] Enable HTTPS (recommended)
- [ ] Set up regular backups
- [ ] Monitor access logs

### Network Security
- [ ] Restrict access to authorized IPs only
- [ ] Use VPN for remote access
- [ ] Implement rate limiting
- [ ] Monitor for suspicious activity

## 📊 Monitoring

### Process Management
```bash
# Check if server is running
ps aux | grep "node server/index.js"

# Check PM2 status (if using PM2)
pm2 status

# View logs
pm2 logs glico-survey-backend
```

### Database Backup
```bash
# Backup database
cp glico_survey.db glico_survey_backup_$(date +%Y%m%d_%H%M%S).db
```

## 🛠️ Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill existing processes
sudo lsof -ti:5000 | xargs kill -9
sudo lsof -ti:3000 | xargs kill -9
```

#### Permission Issues
```bash
# Make scripts executable
chmod +x *.sh
```

#### Database Issues
```bash
# Reset database
rm glico_survey.db
npm run setup-db
npm run create-admin
```

#### CORS Issues
- Verify `FRONTEND_URL` environment variable
- Check CORS configuration in server
- Ensure firewall allows cross-origin requests

## 📞 Support

### Logs Location
- Server logs: Console output or PM2 logs
- Database: `./glico_survey.db`
- Uploads: `./server/uploads/`

### Useful Commands
```bash
# Restart server
npm run pm2:restart

# View server status
npm run pm2:status

# Stop server
npm run pm2:stop

# Update application
git pull && npm run build && npm run pm2:restart
```

---

**Deployment Status**: ✅ Ready for Production

The GLICO Survey System is configured and ready for deployment on your in-house server at `10.200.201.9`.