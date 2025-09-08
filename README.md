# GLICO Survey Platform

A comprehensive, modern survey platform built with React and Node.js, featuring drag & drop survey builder, real-time analytics, template management, and advanced customization options.

## 🚀 Key Features

### 📝 Survey Builder
- **Drag & Drop Interface**: Intuitive visual survey builder with real-time preview
- **Multiple Question Types**:
  - Multiple choice (single/multiple selection)
  - Text input (short/long form)
  - Rating scales (1-10, Likert scale)
  - Emoji rating scales with custom visuals
  - Image upload questions
  - Date/time pickers
  - Custom visual scales (smileys, thumbs, stars, hearts)

### 🎨 Advanced Customization
- **Theme Management**: Custom color schemes, fonts, and layouts
- **Template System**: Pre-built survey templates with customization options
- **Visual Elements**: Custom emoji scales, icons, and branding
- **Responsive Design**: Mobile-first approach with device-specific layouts

### 📊 Analytics & Reporting
- **Real-time Analytics**: Live response tracking and visualization
- **Interactive Dashboards**: Comprehensive analytics with charts and metrics
- **Export Options**: PDF and CSV report generation
- **Response Insights**: Detailed analysis of survey performance and user engagement

### 🔧 Survey Management
- **Publish/Unpublish**: Control survey visibility and access
- **Share Options**: Direct links, QR codes, and embed codes
- **Response Management**: View, filter, and analyze responses
- **Template Library**: Create, edit, and manage survey templates

### 👥 User Management
- **Role-based Access**: Admin, user, and guest roles
- **Authentication**: Secure login and registration system
- **Profile Management**: User preferences and settings

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Data visualization and analytics charts
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **React Hook Form** - Form management and validation

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web application framework
- **SQLite** - Lightweight database
- **JWT** - Authentication and authorization
- **Multer** - File upload handling
- **Bcrypt** - Password hashing

### Additional Libraries
- **@heroicons/react** - Icon library
- **lucide-react** - Additional icons
- **react-beautiful-dnd** - Drag and drop functionality
- **react-hot-toast** - Notification system
- **qrcode** - QR code generation
- **jspdf** - PDF generation
- **html2canvas** - Screenshot functionality

## 📁 Project Structure

```
GLICOSURVEY-main/
├── client/                     # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── analytics/      # Analytics components
│   │   │   ├── sharing/        # Sharing and embed components
│   │   │   ├── survey-builder/ # Survey builder components
│   │   │   └── templates/      # Template components
│   │   ├── pages/              # Page components
│   │   ├── contexts/           # React contexts
│   │   ├── services/           # API service functions
│   │   └── assets/             # Static assets
│   ├── public/                 # Public assets
│   └── build/                  # Production build
├── server/                     # Node.js backend
│   ├── routes/                 # API route handlers
│   ├── middleware/             # Express middleware
│   ├── database/               # Database setup and migrations
│   ├── scripts/                # Utility scripts
│   └── uploads/                # File upload storage
├── public/                     # Shared public assets
└── glico_survey.db            # SQLite database
```

## 🚀 Quick Start

### Prerequisites
- Node.js (>= 18.0.0)
- npm (>= 8.0.0)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GLICOSURVEY-main
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up the database**
   ```bash
   npm run setup-db
   ```

4. **Create admin user (optional)**
   ```bash
   npm run create-admin
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📋 Available Scripts

### Development
- `npm run dev` - Start both frontend and backend in development mode
- `npm run client` - Start only the React frontend
- `npm run server` - Start only the Node.js backend

### Database
- `npm run setup-db` - Initialize the database with tables and sample data
- `npm run migrate` - Run database migrations

### User Management
- `npm run create-admin` - Create a super admin user
- `npm run create-test-admin` - Create a test admin user
- `npm run create-guest` - Create a guest user
- `npm run update-guest-role` - Update guest user role

### Templates
- `npm run create-platinum-template` - Create a platinum banking template

### Production
- `npm run build` - Build the React app for production
- `npm run start` - Start the production server
- `npm run start:prod` - Start with production environment

### PM2 (Process Manager)
- `npm run pm2:start` - Start with PM2
- `npm run pm2:stop` - Stop PM2 processes
- `npm run pm2:restart` - Restart PM2 processes
- `npm run pm2:delete` - Delete PM2 processes

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=./glico_survey.db

# JWT
JWT_SECRET=your_jwt_secret_here

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./server/uploads

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Database Schema
The application uses SQLite with the following main tables:
- `users` - User accounts and authentication
- `surveys` - Survey metadata and settings
- `questions` - Survey questions and configurations
- `responses` - User responses to surveys
- `custom_templates` - User-created survey templates
- `themes` - Custom theme configurations

## 🎨 Features in Detail

### Survey Builder
- **Visual Editor**: Drag and drop interface for creating surveys
- **Question Types**: Support for multiple question formats
- **Real-time Preview**: See changes instantly as you build
- **Validation**: Built-in form validation and error handling

### Analytics Dashboard
- **Response Tracking**: Real-time response monitoring
- **Visual Charts**: Interactive charts and graphs
- **Export Options**: Generate PDF and CSV reports
- **Performance Metrics**: Survey completion rates and engagement

### Template System
- **Pre-built Templates**: Ready-to-use survey templates
- **Custom Templates**: Create and save your own templates
- **Template Sharing**: Publish templates for others to use
- **Category Management**: Organize templates by category

### Sharing & Distribution
- **Direct Links**: Share surveys via direct URLs
- **QR Codes**: Generate QR codes for easy mobile access
- **Embed Codes**: Embed surveys in websites
- **Social Sharing**: Share on social media platforms

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start:prod
```

### PM2 Deployment
```bash
npm run pm2:start
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Set up proper CORS origins
4. Configure file upload limits
5. Set secure JWT secrets

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **CORS Protection**: Configurable cross-origin resource sharing
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Server-side input validation and sanitization
- **File Upload Security**: Secure file upload handling

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Surveys
- `GET /api/surveys` - Get user surveys
- `POST /api/surveys` - Create new survey
- `PUT /api/surveys/:id` - Update survey
- `DELETE /api/surveys/:id` - Delete survey
- `POST /api/surveys/:id/publish` - Publish survey
- `POST /api/surveys/:id/unpublish` - Unpublish survey

### Templates
- `GET /api/templates` - Get available templates
- `POST /api/templates` - Create custom template
- `PUT /api/templates/:id` - Update template
- `POST /api/templates/:id/publish` - Publish template
- `POST /api/templates/:id/unpublish` - Unpublish template

### Analytics
- `GET /api/analytics/survey/:id` - Get survey analytics
- `GET /api/analytics/dashboard` - Get dashboard data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Open an issue in the repository
- Check the documentation in the `/docs` folder
- Review the API documentation

## 🎯 Roadmap

### Completed Features ✅
- [x] Survey Builder with drag & drop
- [x] Multiple question types
- [x] Real-time analytics
- [x] Template system
- [x] User authentication
- [x] Export functionality
- [x] Mobile responsive design
- [x] Theme customization

### Upcoming Features 🔄
- [ ] Advanced analytics with AI insights
- [ ] Multi-language support
- [ ] Advanced scheduling and automation
- [ ] Integration with external services
- [ ] Advanced user permissions
- [ ] Survey collaboration features

---

**Built with ❤️ by the GLICO Survey Team**