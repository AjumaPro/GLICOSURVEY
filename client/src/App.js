import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SurveyBuilder from './pages/SurveyBuilder';
import SurveyAnalytics from './pages/SurveyAnalytics';
import SurveyResponse from './pages/SurveyResponse';
import SurveyTemplates from './pages/SurveyTemplates';
import TemplateEditor from './pages/TemplateEditor';
import Surveys from './pages/Surveys';
import PublishedSurveys from './pages/PublishedSurveys';
import SurveyPreview from './pages/SurveyPreview';
import PublishSurvey from './pages/PublishSurvey';
import SurveyReview from './components/SurveyReview';
import SurveyEditor from './components/SurveyEditor';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import EmojiTest from './pages/EmojiTest';
import Themes from './pages/Themes';
import ThemeEditor from './pages/ThemeEditor';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Admin Route Component (only for admin users)
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <ProtectedRoute>
          <Register />
        </ProtectedRoute>
      } />
      
      {/* Survey Response Route (Public) */}
      <Route path="/survey/:id" element={<SurveyResponse />} />
      <Route path="/s/:id" element={<SurveyResponse />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="surveys" element={<Surveys />} />
        <Route path="surveys/published" element={<PublishedSurveys />} />
        <Route path="preview/:id" element={<SurveyPreview />} />
                   <Route path="templates" element={<SurveyTemplates />} />
           <Route path="templates/:id/edit" element={<TemplateEditor />} />
           <Route path="builder" element={<SurveyBuilder />} />
                   <Route path="builder/:id" element={<SurveyBuilder />} />
        <Route path="review/:id" element={<SurveyReview />} />
        <Route path="editor/:id" element={<SurveyEditor />} />
        <Route path="publish/:id" element={<PublishSurvey />} />
        <Route path="analytics/:id" element={<SurveyAnalytics />} />
        <Route path="themes" element={<Themes />} />
        <Route path="themes/create" element={<ThemeEditor />} />
        <Route path="themes/:id/edit" element={<ThemeEditor />} />
        <Route path="themes/:id/preview" element={<ThemeEditor />} />
        <Route path="admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="profile" element={<Profile />} />
        <Route path="emoji-test" element={<EmojiTest />} />
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App; 