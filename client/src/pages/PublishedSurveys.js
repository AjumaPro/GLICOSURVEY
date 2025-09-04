import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus,
  FileText,
  BarChart3,
  Settings,
  Copy,
  Trash2,
  Eye,
  Download,
  Share2,
  Calendar,
  Users,
  TrendingUp,
  MoreHorizontal,
  Edit3,
  Share,
  Archive,
  RefreshCw,
  Filter,
  Search,
  Globe,
  Link as LinkIcon,
  EyeOff,
  Pause,
  Play,
  QrCode,
  ExternalLink
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import QRCodeShare from '../components/QRCodeShare';

const PublishedSurveys = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('responses');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [shareModal, setShareModal] = useState({ open: false, survey: null, shareInfo: null });

  useEffect(() => {
    fetchPublishedSurveys();
    
    // Listen for survey response submissions to refresh data
    const handleSurveyResponse = (event) => {
      if (event.detail && event.detail.surveyId) {
        // Refresh the surveys list to show updated response counts
        fetchPublishedSurveys();
      }
    };
    
    window.addEventListener('surveyResponseSubmitted', handleSurveyResponse);
    
    return () => {
      window.removeEventListener('surveyResponseSubmitted', handleSurveyResponse);
    };
  }, []);

  const fetchPublishedSurveys = async () => {
    try {
      const response = await axios.get('/api/surveys/published');
      setSurveys(response.data);
    } catch (error) {
      console.error('Error fetching published surveys:', error);
      toast.error('Failed to load published surveys');
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async (id) => {
    if (window.confirm('Are you sure you want to unpublish this survey? It will no longer be accessible to respondents.')) {
      try {
        await axios.post(`/api/surveys/${id}/unpublish`);
        toast.success('Survey unpublished successfully');
        fetchPublishedSurveys();
      } catch (error) {
        console.error('Error unpublishing survey:', error);
        toast.error('Failed to unpublish survey');
      }
    }
  };

  const handleArchive = async (id) => {
    if (window.confirm('Are you sure you want to archive this survey? It will be hidden from your active surveys.')) {
      try {
        await axios.patch(`/api/surveys/${id}`, { status: 'archived' });
        toast.success('Survey archived successfully');
        fetchPublishedSurveys();
      } catch (error) {
        console.error('Error archiving survey:', error);
        toast.error('Failed to archive survey');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this survey? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/surveys/${id}`);
        toast.success('Survey deleted successfully');
        fetchPublishedSurveys();
      } catch (error) {
        console.error('Error deleting survey:', error);
        toast.error('Failed to delete survey');
      }
    }
  };

  const handleCopy = async (id) => {
    try {
      const response = await axios.post(`/api/surveys/${id}/copy`);
      toast.success('Survey copied successfully');
      fetchPublishedSurveys();
      // Navigate to the new survey builder
      navigate(`/builder/${response.data.survey.id}`);
    } catch (error) {
      console.error('Error copying survey:', error);
      toast.error('Failed to copy survey');
    }
  };

  const handleExport = async (id) => {
    try {
      const response = await axios.get(`/api/responses/export/${id}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `survey-${id}-responses.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Responses exported successfully');
    } catch (error) {
      console.error('Error exporting responses:', error);
      toast.error('Failed to export responses');
    }
  };

  const handleShare = async (survey) => {
    try {
      const response = await axios.get(`/api/surveys/${survey.id}/share`);
      setShareModal({
        open: true,
        survey: survey,
        shareInfo: response.data
      });
    } catch (error) {
      console.error('Error sharing survey:', error);
      toast.error('Failed to share survey');
    }
  };

  const handleQRCode = async (survey) => {
    try {
      const response = await axios.get(`/api/surveys/${survey.id}/share`);
      setShareModal({
        open: true,
        survey: survey,
        shareInfo: response.data
      });
    } catch (error) {
      console.error('Error opening QR code:', error);
      toast.error('Failed to open QR code');
    }
  };

  const handleQuickShare = async (survey) => {
    try {
      const response = await axios.get(`/api/surveys/${survey.id}/share`);
      const shareUrl = response.data.shareUrl;
      
      if (navigator.share) {
        await navigator.share({
          title: survey.title,
          text: `Take this survey: ${survey.title}`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Survey link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing survey:', error);
      toast.error('Failed to share survey');
    }
  };

  const handleCopyShortUrl = async (survey) => {
    try {
      const response = await axios.get(`/api/surveys/${survey.id}/share`);
      const shortUrl = response.data.shortUrl;
      
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shortUrl);
        toast.success('Short URL copied to clipboard!');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shortUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Short URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Error copying short URL:', error);
      toast.error('Failed to copy short URL');
    }
  };

  const filteredSurveys = surveys
    .filter(survey => {
      const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (survey.description && survey.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'responses':
          return (b.responses_count || 0) - (a.responses_count || 0);
        case 'created_at':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'recent_activity':
          return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
        default:
          return (b.responses_count || 0) - (a.responses_count || 0);
      }
    });

  const getResponseRate = (responses, questions) => {
    if (!responses || !questions) return 0;
    return Math.round((responses / questions) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
          <span className="text-gray-600">Loading published surveys...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Globe className="h-6 w-6 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Published Surveys</h1>
          </div>
          <p className="text-gray-600">Manage your live surveys and track responses</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchPublishedSurveys}
            className="btn-secondary"
            title="Refresh surveys"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <Link
            to="/builder"
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Survey
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search published surveys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          
          {/* Sort Options */}
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input max-w-xs"
            >
              <option value="responses">Most Responses</option>
              <option value="created_at">Newest First</option>
              <option value="title">Alphabetical</option>
              <option value="recent_activity">Recent Activity</option>
            </select>
            
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === 'grid' 
                    ? 'bg-primary-100 text-primary-700 border-primary-300' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === 'list' 
                    ? 'bg-primary-100 text-primary-700 border-primary-300' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Surveys Display */}
      {filteredSurveys.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
          <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {surveys.length === 0 ? 'No published surveys yet' : 'No published surveys match your search'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {surveys.length === 0 
              ? 'Publish your first survey to start collecting responses from respondents'
              : 'Try adjusting your search terms to find what you\'re looking for'
            }
          </p>
          {surveys.length === 0 && (
            <Link
              to="/builder"
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Survey
            </Link>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSurveys.map((survey) => (
            <div key={survey.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                      {survey.title}
                    </h3>
                    {survey.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {survey.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      <Globe className="h-3 w-3 mr-1" />
                      Live
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>{survey.questions?.length || 0} questions</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{survey.responses_count || 0} responses</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(survey.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{getResponseRate(survey.responses_count, survey.questions?.length)}% rate</span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-4">
                {/* Primary Actions */}
                <div className="flex space-x-2 mb-3">
                  <Link
                    to={`/preview/${survey.id}`}
                    className="flex-1 btn-secondary text-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Link>
                  <Link
                    to={`/analytics/${survey.id}`}
                    className="flex-1 btn-secondary text-center"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Link>
                </div>

                {/* Secondary Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleQRCode(survey)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                      title="Share with QR Code"
                    >
                      <QrCode className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleQuickShare(survey)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                      title="Quick Share"
                    >
                      <Share className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleCopyShortUrl(survey)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                      title="Copy Short URL"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Link
                      to={`/builder/${survey.id}`}
                      className="p-2 text-blue-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50"
                      title="Edit Survey"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleExport(survey.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                      title="Export Responses"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleUnpublish(survey.id)}
                      className="p-2 text-yellow-400 hover:text-yellow-600 transition-colors rounded-md hover:bg-yellow-50"
                      title="Unpublish Survey"
                    >
                      <EyeOff className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleArchive(survey.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                      title="Archive Survey"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(survey.id)}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50"
                      title="Delete Survey"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Survey
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Questions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Published
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSurveys.map((survey) => (
                  <tr key={survey.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Globe className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{survey.title}</div>
                          {survey.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {survey.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {survey.questions?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {survey.responses_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getResponseRate(survey.responses_count, survey.questions?.length)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(survey.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/preview/${survey.id}`}
                          className="text-primary-600 hover:text-primary-900"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/analytics/${survey.id}`}
                          className="text-primary-600 hover:text-primary-900"
                          title="Analytics"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/builder/${survey.id}`}
                          className="text-primary-600 hover:text-primary-900"
                          title="Edit Survey"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleQRCode(survey)}
                          className="text-gray-400 hover:text-gray-600"
                          title="QR Code"
                        >
                          <QrCode className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleQuickShare(survey)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Share"
                        >
                          <Share className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCopyShortUrl(survey)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Short URL"
                        >
                          <LinkIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleExport(survey.id)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Export"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUnpublish(survey.id)}
                          className="text-yellow-400 hover:text-yellow-600"
                          title="Unpublish"
                        >
                          <EyeOff className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(survey.id)}
                          className="text-red-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {surveys.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{surveys.length}</div>
              <div className="text-sm text-gray-600">Published Surveys</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {surveys.reduce((sum, s) => sum + (s.responses_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Responses</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(surveys.reduce((sum, s) => sum + (s.responses_count || 0), 0) / surveys.length)}
              </div>
              <div className="text-sm text-gray-600">Avg Responses</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(surveys.reduce((sum, s) => sum + getResponseRate(s.responses_count, s.questions?.length), 0) / surveys.length)}%
              </div>
              <div className="text-sm text-gray-600">Avg Response Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModal.open && shareModal.survey && shareModal.shareInfo && (
        <QRCodeShare
          surveyUrl={shareModal.shareInfo.shareUrl}
          shortUrl={shareModal.shareInfo.shortUrl}
          surveyTitle={shareModal.survey.title}
          onClose={() => setShareModal({ open: false, survey: null, shareInfo: null })}
        />
      )}
    </div>
  );
};

export default PublishedSurveys; 