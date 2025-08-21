# IIS Windows Server Deployment Guide

## Prerequisites

### Windows Server Requirements
- Windows Server 2016/2019/2022
- IIS 10+ installed
- Node.js 18+ installed
- PostgreSQL installed (or use remote database)

### IIS Features Required
- Web Server (IIS)
- Application Development Features
- Common HTTP Features
- Health and Diagnostics
- Performance Features
- Security Features

## Step 1: Install Required Components

### Install IIS Features
```powershell
# Open PowerShell as Administrator
Install-WindowsFeature -Name Web-Server -IncludeManagementTools
Install-WindowsFeature -Name Web-Common-Http
Install-WindowsFeature -Name Web-Default-Doc
Install-WindowsFeature -Name Web-Dir-Browsing
Install-WindowsFeature -Name Web-Http-Errors
Install-WindowsFeature -Name Web-Http-Logging
Install-WindowsFeature -Name Web-Request-Monitor
Install-WindowsFeature -Name Web-Stat-Compression
Install-WindowsFeature -Name Web-Filtering
Install-WindowsFeature -Name Web-Basic-Auth
Install-WindowsFeature -Name Web-Windows-Auth
Install-WindowsFeature -Name Web-Client-Auth
Install-WindowsFeature -Name Web-Url-Auth
Install-WindowsFeature -Name Web-WebSockets
```

### Install Node.js
1. Download Node.js 18+ from https://nodejs.org/
2. Install with default settings
3. Verify installation: `node --version`

### Install iisnode
```powershell
# Download and install iisnode
# Download from: https://github.com/Azure/iisnode/releases
# Or use npm: npm install -g iisnode
```

### Install PostgreSQL (if local)
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password for postgres user

## Step 2: Prepare Application Files

### Clone and Build Application
```cmd
# Clone repository
git clone https://github.com/AjumaPro/GLICOSURVEY.git
cd GLICOSURVEY

# Install dependencies
npm install
cd client && npm install && cd ..

# Build React application
npm run build
```

### Create Production Environment
```cmd
# Copy production environment template
copy env.production .env

# Edit .env file with your settings
notepad .env
```

**Update these values in .env:**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/glico_survey_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
FRONTEND_URL=http://your-server-ip
```

## Step 3: Setup Database

### Create Database (if using local PostgreSQL)
```cmd
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE USER glico_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE glico_survey_db OWNER glico_user;
GRANT ALL PRIVILEGES ON DATABASE glico_survey_db TO glico_user;
\q

# Setup database schema
npm run setup-db
npm run migrate
npm run create-admin
```

## Step 4: Configure IIS

### Create Application Pool
1. Open IIS Manager
2. Right-click "Application Pools" → "Add Application Pool"
3. Name: `GLICOSurvey`
4. .NET CLR Version: "No Managed Code"
5. Managed Pipeline Mode: "Integrated"

### Create Website
1. Right-click "Sites" → "Add Website"
2. Site name: `GLICOSurvey`
3. Application pool: `GLICOSurvey`
4. Physical path: `C:\inetpub\wwwroot\glico-survey`
5. Port: `80` (or your preferred port)

### Copy Application Files
```cmd
# Create website directory
mkdir C:\inetpub\wwwroot\glico-survey

# Copy application files
xcopy /E /I /Y . C:\inetpub\wwwroot\glico-survey

# Set permissions
icacls "C:\inetpub\wwwroot\glico-survey" /grant "IIS_IUSRS:(OI)(CI)F"
icacls "C:\inetpub\wwwroot\glico-survey" /grant "NETWORK SERVICE:(OI)(CI)F"
```

### Configure web.config
1. Ensure `web.config` is in the root directory
2. Update paths if needed in the web.config file

## Step 5: Configure Application Pool

### Set Application Pool Identity
1. In IIS Manager, select the `GLICOSurvey` application pool
2. Click "Advanced Settings"
3. Set "Identity" to "ApplicationPoolIdentity"

### Enable 32-bit Applications (if needed)
1. Select the application pool
2. Click "Advanced Settings"
3. Set "Enable 32-Bit Applications" to "True" (if using 32-bit Node.js)

## Step 6: Configure Environment Variables

### Set Environment Variables
```cmd
# Set NODE_ENV
setx NODE_ENV "production" /M

# Set other environment variables as needed
setx DATABASE_URL "postgresql://username:password@localhost:5432/glico_survey_db" /M
setx JWT_SECRET "your-super-secret-jwt-key-change-this-in-production-2024" /M
```

## Step 7: Test Deployment

### Start the Website
1. In IIS Manager, select the website
2. Click "Start" in the Actions pane

### Test Access
1. **Frontend:** `http://your-server-ip/`
2. **API:** `http://your-server-ip/api/`
3. **Health Check:** `http://your-server-ip/health`

### Test Login
- Email: `admin@glico.com`
- Password: `admin123`

## Step 8: Configure Firewall

### Windows Firewall
```cmd
# Allow HTTP traffic
netsh advfirewall firewall add rule name="GLICO Survey HTTP" dir=in action=allow protocol=TCP localport=80

# Allow HTTPS traffic (if using SSL)
netsh advfirewall firewall add rule name="GLICO Survey HTTPS" dir=in action=allow protocol=TCP localport=443
```

## Step 9: SSL Configuration (Optional but Recommended)

### Install SSL Certificate
1. Obtain SSL certificate (Let's Encrypt, commercial, or self-signed)
2. Install certificate in Windows Certificate Store
3. Bind certificate to website in IIS Manager

### Configure HTTPS Redirect
Add to web.config:
```xml
<rule name="HTTP to HTTPS redirect" stopProcessing="true">
    <match url="(.*)" />
    <conditions>
        <add input="{HTTPS}" pattern="off" ignoreCase="true" />
    </conditions>
    <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" redirectType="Permanent" />
</rule>
```

## Troubleshooting

### Common Issues

1. **500.19 Error (Configuration Error)**
   - Check if URL Rewrite module is installed
   - Verify web.config syntax

2. **500.21 Error (Handler Error)**
   - Ensure iisnode is properly installed
   - Check application pool configuration

3. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check connection string in .env
   - Ensure firewall allows database connections

4. **Permission Issues**
   - Grant proper permissions to IIS_IUSRS
   - Check file system permissions

### Logs Location
- **IIS Logs:** `C:\inetpub\logs\LogFiles\`
- **Application Logs:** `C:\inetpub\wwwroot\glico-survey\logs\`
- **Event Viewer:** Windows Logs → Application

### Performance Optimization

1. **Enable Compression**
   - Already configured in web.config

2. **Configure Caching**
   - Static files are cached by default

3. **Database Optimization**
   ```sql
   -- Add indexes for better performance
   CREATE INDEX idx_surveys_user_id ON surveys(user_id);
   CREATE INDEX idx_responses_survey_id ON responses(survey_id);
   ```

## Security Checklist

- [ ] Change JWT_SECRET to a secure random string
- [ ] Update database password
- [ ] Change admin password
- [ ] Configure Windows Firewall
- [ ] Set up SSL/TLS certificates
- [ ] Configure request filtering
- [ ] Set up monitoring and logging

## Monitoring

### Application Monitoring
- Use IIS Manager for basic monitoring
- Consider Application Insights for detailed monitoring
- Set up Windows Performance Monitor

### Database Monitoring
- Use PostgreSQL's built-in monitoring
- Set up log rotation
- Monitor connection pool usage

## Backup Strategy

### Application Backup
```cmd
# Backup application files
robocopy C:\inetpub\wwwroot\glico-survey C:\backup\glico-survey /MIR

# Backup database
pg_dump -U glico_user glico_survey_db > C:\backup\database_backup.sql
```

### Automated Backup Script
Create a scheduled task to run backups daily/weekly.

## Support

If you encounter issues:
1. Check IIS logs: `C:\inetpub\logs\LogFiles\`
2. Check application logs: `C:\inetpub\wwwroot\glico-survey\logs\`
3. Check Event Viewer for system errors
4. Verify all prerequisites are installed
5. Test database connectivity
6. Check file permissions 