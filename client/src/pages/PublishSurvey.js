import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Globe,
  Lock,
  Copy,
  Share,
  Eye,
  BarChart3,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Settings,
  QrCode
} from 'lucide-react';
import QRCodeShare from '../components/QRCodeShare';
import { motion } from 'framer-motion';

const PublishSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const fetchSurvey = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/surveys/${id}`);
      setSurvey(response.data);
    } catch (error) {
      console.error('Error fetching survey:', error);
      toast.error('Failed to load survey');
      navigate('/surveys');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      fetchSurvey();
    }
    
    // Listen for survey response submissions to refresh data
    const handleSurveyResponse = (event) => {
      if (event.detail && event.detail.surveyId === parseInt(id)) {
        // Refresh the survey data to show updated response counts
        fetchSurvey();
      }
    };
    
    window.addEventListener('surveyResponseSubmitted', handleSurveyResponse);
    
    return () => {
      window.removeEventListener('surveyResponseSubmitted', handleSurveyResponse);
    };
  }, [fetchSurvey, id]);

  const publishSurvey = async () => {
    try {
      setPublishing(true);
      await axios.post(`/api/surveys/${id}/publish`);
      toast.success('Survey published successfully!');
      fetchSurvey(); // Refresh survey data
    } catch (error) {
      console.error('Error publishing survey:', error);
      toast.error('Failed to publish survey');
    } finally {
      setPublishing(false);
    }
  };

  const unpublishSurvey = async () => {
    try {
      setPublishing(true);
      await axios.post(`/api/surveys/${id}/unpublish`);
      toast.success('Survey unpublished successfully!');
      fetchSurvey(); // Refresh survey data
    } catch (error) {
      console.error('Error unpublishing survey:', error);
      toast.error('Failed to unpublish survey');
    } finally {
      setPublishing(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleDuplicate = async () => {
    try {
      setPublishing(true);
      const response = await axios.post(`/api/surveys/${id}/copy`);
      toast.success('Survey duplicated successfully!');
      // Navigate to the new survey builder
      navigate(`/builder/${response.data.survey.id}`);
    } catch (error) {
      console.error('Error duplicating survey:', error);
      toast.error('Failed to duplicate survey');
    } finally {
      setPublishing(false);
    }
  };

  const getPublicUrl = () => {
    return `${window.location.origin}/survey/${id}`;
  };

  const getPreviewUrl = () => {
    return `${window.location.origin}/preview/${id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Survey not found</h3>
          <p className="text-gray-600 mb-4">The survey you're looking for doesn't exist.</p>
          <Link to="/surveys" className="btn-primary">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Surveys
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link to="/surveys" className="btn-secondary">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Surveys
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Publish Survey</h1>
                <p className="text-gray-600 mt-1">Manage your survey's visibility and sharing</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link to={`/builder/${id}`} className="btn-secondary">
                <Edit className="h-4 w-4 mr-2" />
                Edit Survey
              </Link>
              <Link to={`/analytics/${id}`} className="btn-secondary">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Link>
            </div>
          </div>

          {/* Survey Info */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{survey.title}</h2>
                <p className="text-gray-600 mt-1">{survey.description}</p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 ${
                survey.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {survey.status === 'published' ? (
                  <>
                    <Globe className="h-4 w-4" />
                    <span>Published</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Draft</span>
                  </>
                )}
              </div>
            </div>

            {/* Survey Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600">Questions</p>
                    <p className="text-2xl font-bold text-blue-900">{survey.questions?.length || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600">Responses</p>
                    <p className="text-2xl font-bold text-green-900">{survey.responses_count || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-600">Created</p>
                    <p className="text-sm font-bold text-purple-900">
                      {new Date(survey.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Settings className="h-8 w-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-orange-600">Updated</p>
                    <p className="text-sm font-bold text-orange-900">
                      {new Date(survey.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Publishing Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Publish Controls */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Publishing Controls</h3>
            
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Survey Status</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    survey.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {survey.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {survey.status === 'published' 
                    ? 'Your survey is live and accessible to respondents.'
                    : 'Your survey is in draft mode and not accessible to the public.'
                  }
                </p>
                
                {survey.status === 'published' ? (
                  <button
                    onClick={unpublishSurvey}
                    disabled={publishing}
                    className="btn-secondary w-full"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {publishing ? 'Unpublishing...' : 'Unpublish Survey'}
                  </button>
                ) : (
                  <button
                    onClick={publishSurvey}
                    disabled={publishing}
                    className="btn-primary w-full"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    {publishing ? 'Publishing...' : 'Publish Survey'}
                  </button>
                )}
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Survey Links</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Public Survey Link
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={getPublicUrl()}
                        readOnly
                        className="flex-1 p-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(getPublicUrl())}
                        className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preview Link
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={getPreviewUrl()}
                        readOnly
                        className="flex-1 p-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(getPreviewUrl())}
                        className="px-3 py-2 bg-gray-600 text-white rounded-r-lg hover:bg-gray-700 transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {survey.status === 'published' && (
                    <div className="pt-3 border-t border-gray-200">
                      <button
                        onClick={() => setShowQRCode(true)}
                        className="w-full flex items-center justify-center p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        Generate QR Code
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <Link
                to={`/preview/${id}`}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <Eye className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Preview Survey</h4>
                  <p className="text-sm text-gray-600">View how your survey looks to respondents</p>
                </div>
              </Link>

              <Link
                to={`/builder/${id}`}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <Edit className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Edit Survey</h4>
                  <p className="text-sm text-gray-600">Modify questions and settings</p>
                </div>
              </Link>

              <Link
                to={`/analytics/${id}`}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <BarChart3 className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">View Analytics</h4>
                  <p className="text-sm text-gray-600">See response data and insights</p>
                </div>
              </Link>

              <button
                onClick={handleDuplicate}
                disabled={publishing}
                className="flex items-center w-full p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Copy className="h-5 w-5 text-orange-600 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">
                    {publishing ? 'Duplicating...' : 'Duplicate Survey'}
                  </h4>
                  <p className="text-sm text-gray-600">Create a copy for variations</p>
                </div>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Survey Preview */}
        {survey.questions && survey.questions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-white rounded-lg shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Survey Preview</h3>
            <div className="space-y-3">
              {survey.questions.slice(0, 3).map((question, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{question.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                        {question.type.replace('_', ' ')}
                      </span>
                      {question.required && (
                        <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {survey.questions.length > 3 && (
                <div className="text-center py-2">
                  <span className="text-sm text-gray-500">
                    +{survey.questions.length - 3} more questions
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <QRCodeShare
          surveyUrl={getPublicUrl()}
          surveyTitle={survey.title}
          onClose={() => setShowQRCode(false)}
        />
      )}
    </div>
  );
};

export default PublishSurvey; 