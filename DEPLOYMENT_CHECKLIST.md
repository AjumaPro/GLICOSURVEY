# ✅ In-House Server Deployment Checklist

## 🖥️ Server Preparation

- [ ] **Server Specifications**
  - [ ] OS: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
  - [ ] RAM: 4GB+ (8GB recommended)
  - [ ] Storage: 20GB+ available
  - [ ] CPU: 2+ cores
  - [ ] Static IP or domain name configured

- [ ] **Network Configuration**
  - [ ] Static IP address assigned
  - [ ] Domain name pointing to server (optional)
  - [ ] Port 80 and 443 accessible from internet
  - [ ] Firewall configured

## 🛠️ Software Installation

- [ ] **System Updates**
  - [ ] `sudo apt update && sudo apt upgrade -y`

- [ ] **Node.js Installation**
  - [ ] Node.js 18.x+ installed
  - [ ] npm available

- [ ] **PostgreSQL Installation**
  - [ ] PostgreSQL 13.x+ installed
  - [ ] Service running and enabled
  - [ ] Database created: `surveyguy_db`
  - [ ] User created with proper permissions

- [ ] **PM2 Installation**
  - [ ] PM2 installed globally
  - [ ] PM2 startup configured

- [ ] **Nginx Installation** (Optional but recommended)
  - [ ] Nginx installed
  - [ ] Service running and enabled
  - [ ] Configuration file created

## 📦 Application Deployment

- [ ] **Repository Setup**
  - [ ] Repository cloned to server
  - [ ] All dependencies installed (`npm run install-all`)
  - [ ] Production environment configured

- [ ] **Environment Configuration**
  - [ ] `.env` file created from `env.production`
  - [ ] Database connection string updated
  - [ ] JWT secret changed to secure value
  - [ ] Admin credentials configured
  - [ ] Frontend URL set to server IP/domain

- [ ] **Database Setup**
  - [ ] Database tables created (`npm run setup-db`)
  - [ ] Migrations run (`npm run migrate`)
  - [ ] Admin user created (`npm run create-admin`)

- [ ] **Application Build**
  - [ ] React app built (`npm run build`)
  - [ ] Build files generated in `client/build/`

## 🚀 Application Launch

- [ ] **PM2 Configuration**
  - [ ] `ecosystem.config.js` present
  - [ ] Logs directory created
  - [ ] Application started with PM2

- [ ] **Service Verification**
  - [ ] Application responding on port 5000
  - [ ] Health check endpoint working
  - [ ] Database connection successful

- [ ] **Nginx Configuration** (if using)
  - [ ] Site configuration created
  - [ ] Default site disabled
  - [ ] Configuration tested
  - [ ] Service restarted

## 🔒 Security Configuration

- [ ] **Firewall Setup**
  - [ ] SSH access allowed
  - [ ] HTTP (80) allowed
  - [ ] HTTPS (443) allowed
  - [ ] Unnecessary ports blocked

- [ ] **SSL Certificate** (Recommended)
  - [ ] Domain name configured
  - [ ] SSL certificate obtained (Let's Encrypt)
  - [ ] HTTPS redirect configured

- [ ] **Password Security**
  - [ ] Default admin password changed
  - [ ] Strong password policy implemented
  - [ ] JWT secret is secure and unique

## 📊 Monitoring & Maintenance

- [ ] **Logging Setup**
  - [ ] Application logs configured
  - [ ] Error logs accessible
  - [ ] Log rotation configured

- [ ] **Backup Strategy**
  - [ ] Database backup script created
  - [ ] Application backup configured
  - [ ] Backup schedule established

- [ ] **Monitoring Tools**
  - [ ] PM2 monitoring enabled
  - [ ] System monitoring configured
  - [ ] Alert system in place

## 🧪 Testing & Validation

- [ ] **Functionality Testing**
  - [ ] Login system working
  - [ ] Survey creation functional
  - [ ] Response collection working
  - [ ] Analytics displaying correctly

- [ ] **Performance Testing**
  - [ ] Application loads quickly
  - [ ] Database queries optimized
  - [ ] Memory usage acceptable

- [ ] **Security Testing**
  - [ ] HTTPS working (if configured)
  - [ ] Rate limiting active
  - [ ] CORS properly configured

## 📋 Post-Deployment

- [ ] **Documentation**
  - [ ] Deployment guide updated
  - [ ] Admin credentials documented
  - [ ] Maintenance procedures documented

- [ ] **User Training**
  - [ ] Admin users trained
  - [ ] User guides created
  - [ ] Support procedures established

- [ ] **Monitoring Setup**
  - [ ] Regular health checks configured
  - [ ] Performance monitoring active
  - [ ] Error alerting enabled

## 🔄 Maintenance Schedule

- [ ] **Daily Tasks**
  - [ ] Check application logs
  - [ ] Monitor system resources
  - [ ] Verify backup completion

- [ ] **Weekly Tasks**
  - [ ] Update system packages
  - [ ] Review security logs
  - [ ] Test backup restoration

- [ ] **Monthly Tasks**
  - [ ] Update Node.js dependencies
  - [ ] Review and rotate secrets
  - [ ] Performance optimization

---

## 🎯 Quick Deployment Commands

```bash
# Run automated setup script
./setup-production.sh

# Manual deployment steps
npm run install-all
cp env.production .env
# Edit .env with your values
npm run setup-db
npm run migrate
npm run create-admin
npm run build
npm run pm2:start
```

## 📞 Emergency Contacts

- **Server Administrator**: [Your Contact]
- **Database Administrator**: [Your Contact]
- **Application Support**: [Your Contact]

---

**✅ All items checked? Your GLICO Survey application is ready for production use!** 