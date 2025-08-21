# GLICO Survey Application - IIS Windows Server Deployment Script
# Run this script as Administrator

param(
    [string]$SiteName = "GLICOSurvey",
    [string]$AppPoolName = "GLICOSurvey",
    [string]$PhysicalPath = "C:\inetpub\wwwroot\glico-survey",
    [string]$Port = "80",
    [string]$ServerIP = "localhost"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

Write-Status "Starting GLICO Survey Application IIS Deployment..."

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "This script must be run as Administrator"
    exit 1
}

# Check prerequisites
Write-Status "Checking prerequisites..."

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Status "Node.js version: $nodeVersion"
} catch {
    Write-Error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Status "npm version: $npmVersion"
} catch {
    Write-Error "npm is not installed."
    exit 1
}

# Check IIS
try {
    $iis = Get-WindowsFeature -Name Web-Server
    if (-not $iis.Installed) {
        Write-Error "IIS is not installed. Please install IIS first."
        exit 1
    }
    Write-Status "IIS is installed"
} catch {
    Write-Error "IIS is not installed. Please install IIS first."
    exit 1
}

# Check iisnode
try {
    $iisnodePath = Get-ChildItem "C:\Program Files\iisnode" -ErrorAction SilentlyContinue
    if (-not $iisnodePath) {
        Write-Warning "iisnode is not installed. Please install iisnode first."
        Write-Status "Download from: https://github.com/Azure/iisnode/releases"
        exit 1
    }
    Write-Status "iisnode is installed"
} catch {
    Write-Warning "iisnode is not installed. Please install iisnode first."
    exit 1
}

# Create necessary directories
Write-Status "Creating necessary directories..."
if (-not (Test-Path $PhysicalPath)) {
    New-Item -ItemType Directory -Path $PhysicalPath -Force | Out-Null
}

# Create logs directory
$logsPath = Join-Path $PhysicalPath "logs"
if (-not (Test-Path $logsPath)) {
    New-Item -ItemType Directory -Path $logsPath -Force | Out-Null
}

# Install dependencies
Write-Status "Installing Node.js dependencies..."
npm install

# Install client dependencies
Write-Status "Installing React client dependencies..."
Set-Location client
npm install
Set-Location ..

# Build the application
Write-Status "Building React application..."
npm run build

# Copy build files to web directory
Write-Status "Copying build files to web directory..."
Copy-Item -Path "client\build\*" -Destination $PhysicalPath -Recurse -Force

# Copy server files
Write-Status "Copying server files..."
Copy-Item -Path "server" -Destination $PhysicalPath -Recurse -Force
Copy-Item -Path "package.json" -Destination $PhysicalPath -Force
Copy-Item -Path "package-lock.json" -Destination $PhysicalPath -Force
Copy-Item -Path "web.config" -Destination $PhysicalPath -Force

# Copy environment file
if (Test-Path ".env") {
    Copy-Item -Path ".env" -Destination $PhysicalPath -Force
    Write-Status "Environment file copied"
} else {
    Write-Warning "No .env file found. Please create one manually."
}

# Set proper permissions
Write-Status "Setting proper permissions..."
$acl = Get-Acl $PhysicalPath
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($accessRule)
Set-Acl -Path $PhysicalPath -AclObject $acl

# Create Application Pool
Write-Status "Creating Application Pool..."
try {
    Import-Module WebAdministration
    if (-not (Test-Path "IIS:\AppPools\$AppPoolName")) {
        New-WebAppPool -Name $AppPoolName
        Set-ItemProperty -Path "IIS:\AppPools\$AppPoolName" -Name "managedRuntimeVersion" -Value ""
        Set-ItemProperty -Path "IIS:\AppPools\$AppPoolName" -Name "processModel.identityType" -Value "ApplicationPoolIdentity"
        Write-Status "Application Pool '$AppPoolName' created"
    } else {
        Write-Status "Application Pool '$AppPoolName' already exists"
    }
} catch {
    Write-Error "Failed to create Application Pool: $($_.Exception.Message)"
    exit 1
}

# Create Website
Write-Status "Creating Website..."
try {
    if (-not (Test-Path "IIS:\Sites\$SiteName")) {
        New-Website -Name $SiteName -ApplicationPool $AppPoolName -PhysicalPath $PhysicalPath -Port $Port
        Write-Status "Website '$SiteName' created on port $Port"
    } else {
        Write-Status "Website '$SiteName' already exists"
    }
} catch {
    Write-Error "Failed to create Website: $($_.Exception.Message)"
    exit 1
}

# Start the website
Write-Status "Starting website..."
try {
    Start-Website -Name $SiteName
    Write-Status "Website started successfully"
} catch {
    Write-Error "Failed to start website: $($_.Exception.Message)"
}

# Setup environment variables
Write-Status "Setting up environment variables..."
try {
    [Environment]::SetEnvironmentVariable("NODE_ENV", "production", "Machine")
    Write-Status "Environment variable NODE_ENV set to production"
} catch {
    Write-Warning "Failed to set environment variable: $($_.Exception.Message)"
}

Write-Status "Deployment completed successfully!"

Write-Host ""
Write-Host "🎉 GLICO Survey Application is now deployed on IIS!"
Write-Host ""
Write-Host "📋 Next steps:"
Write-Host "1. Edit environment file: $PhysicalPath\.env"
Write-Host "   - Update DATABASE_URL with your PostgreSQL credentials"
Write-Host "   - Change JWT_SECRET to a secure random string"
Write-Host "   - Update FRONTEND_URL with your server IP: http://$ServerIP"
Write-Host ""
Write-Host "2. Set up your database:"
Write-Host "   - Create PostgreSQL database: glico_survey_db"
Write-Host "   - Run: npm run setup-db"
Write-Host "   - Run: npm run migrate"
Write-Host "   - Run: npm run create-admin"
Write-Host ""
Write-Host "3. Configure firewall:"
Write-Host "   - Allow port $Port in Windows Firewall"
Write-Host ""
Write-Host "4. Access the application:"
Write-Host "   - Frontend: http://$ServerIP"
Write-Host "   - API: http://$ServerIP/api"
Write-Host "   - Health check: http://$ServerIP/health"
Write-Host ""
Write-Host "🔐 Default admin credentials:"
Write-Host "   - Email: admin@glico.com"
Write-Host "   - Password: admin123"
Write-Host "   - IMPORTANT: Change this password immediately!"
Write-Host ""
Write-Host "📝 Logs:"
Write-Host "   - IIS logs: C:\inetpub\logs\LogFiles\"
Write-Host "   - Application logs: $logsPath"
Write-Host "   - Event Viewer: Windows Logs → Application"
Write-Host "" 