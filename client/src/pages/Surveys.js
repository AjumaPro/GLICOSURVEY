import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  FileText,
  BarChart3,
  Settings,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Calendar,
  Users,
  TrendingUp,
  Edit3,
  Share,
  Archive,
  RefreshCw,
  Search,
  Globe
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Surveys = () => {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');

  useEffect(() => {
    fetchSurveys();
    
    // Listen for survey response submissions to refresh data
    const handleSurveyResponse = (event) => {
      if (event.detail && event.detail.surveyId) {
        // Refresh the surveys list to show updated response counts
        fetchSurveys();
      }
    };
    
    window.addEventListener('surveyResponseSubmitted', handleSurveyResponse);
    
    return () => {
      window.removeEventListener('surveyResponseSubmitted', handleSurveyResponse);
    };
  }, []);

  const fetchSurveys = async () => {
    try {
      const response = await axios.get('/api/surveys');
      setSurveys(response.data);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      toast.error('Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this survey? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/surveys/${id}`);
        toast.success('Survey deleted successfully');
        fetchSurveys();
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
      fetchSurveys();
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

  const handleShare = async (id) => {
    try {
      const response = await axios.get(`/api/surveys/${id}/share`);
      const shareUrl = `${window.location.origin}/survey/${response.data.shareId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Take my survey',
          text: 'Please take a moment to complete this survey',
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

  const handleArchive = async (id) => {
    try {
      await axios.patch(`/api/surveys/${id}`, { status: 'archived' });
      toast.success('Survey archived successfully');
      fetchSurveys();
    } catch (error) {
      console.error('Error archiving survey:', error);
      toast.error('Failed to archive survey');
    }
  };

  const handlePublish = async (id) => {
    try {
      await axios.post(`/api/surveys/${id}/publish`);
      toast.success('Survey published successfully');
      fetchSurveys();
    } catch (error) {
      console.error('Error publishing survey:', error);
      toast.error('Failed to publish survey');
    }
  };

  const handleUnpublish = async (id) => {
    if (window.confirm('Are you sure you want to unpublish this survey? It will no longer be accessible to respondents.')) {
      try {
        await axios.post(`/api/surveys/${id}/unpublish`);
        toast.success('Survey unpublished successfully');
        fetchSurveys();
      } catch (error) {
        console.error('Error unpublishing survey:', error);
        toast.error('Failed to unpublish survey');
      }
    }
  };

  const filteredSurveys = surveys
    .filter(survey => {
      const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (survey.description && survey.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filterStatus === 'all' || survey.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'responses':
          return (b.responses_count || 0) - (a.responses_count || 0);
        case 'created_at':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published':
        return <TrendingUp className="h-3 w-3" />;
      case 'draft':
        return <Edit3 className="h-3 w-3" />;
      case 'archived':
        return <Archive className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
          <span className="text-gray-600">Loading surveys...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Surveys</h1>
          <p className="text-gray-600 mt-1">Create, manage, and analyze your surveys</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchSurveys}
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

      {/* Quick Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Navigation</h3>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/surveys/published"
                className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm font-medium hover:bg-green-100 transition-colors"
              >
                <Globe className="h-4 w-4 mr-2" />
                Published Surveys
                <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                  {surveys.filter(s => s.status === 'published').length}
                </span>
              </Link>
              <Link
                to="/surveys"
                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" />
                All Surveys
                <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                  {surveys.length}
                </span>
              </Link>
            </div>
          </div>
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
                placeholder="Search surveys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="flex space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input max-w-xs"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input max-w-xs"
            >
              <option value="created_at">Newest First</option>
              <option value="title">Alphabetical</option>
              <option value="responses">Most Responses</option>
            </select>
          </div>
        </div>
      </div>

      {/* Surveys Grid */}
      {filteredSurveys.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {surveys.length === 0 ? 'No surveys yet' : 'No surveys match your filters'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {surveys.length === 0 
              ? 'Create your first survey to start collecting responses and insights'
              : 'Try adjusting your search terms or filters to find what you\'re looking for'
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
      ) : (
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
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(survey.status)}`}>
                      {getStatusIcon(survey.status)}
                      <span className="ml-1 capitalize">{survey.status}</span>
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded-md">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-700">{survey.questions?.length || 0} questions</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-md">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-700">{survey.responses_count || 0} responses</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(survey.created_at).toLocaleDateString()}</span>
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
                    <Link
                      to={`/builder/${survey.id}`}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                      title="Edit Survey"
                    >
                      <Settings className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleShare(survey.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                      title="Share Survey"
                    >
                      <Share className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleCopy(survey.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                      title="Copy Survey"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex space-x-1">
                    {survey.status === 'draft' && (
                      <button
                        onClick={() => handlePublish(survey.id)}
                        className="p-2 text-green-400 hover:text-green-600 transition-colors rounded-md hover:bg-green-50"
                        title="Publish Survey"
                      >
                        <Globe className="h-4 w-4" />
                      </button>
                    )}
                    {survey.status === 'published' && (
                      <button
                        onClick={() => handleUnpublish(survey.id)}
                        className="p-2 text-yellow-400 hover:text-yellow-600 transition-colors rounded-md hover:bg-yellow-50"
                        title="Unpublish Survey"
                      >
                        <EyeOff className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleExport(survey.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                      title="Export Responses"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    {survey.status !== 'archived' && (
                      <button
                        onClick={() => handleArchive(survey.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                        title="Archive Survey"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    )}
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
      )}

      {/* Summary Stats */}
      {surveys.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{surveys.length}</div>
              <div className="text-sm text-gray-600">Total Surveys</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {surveys.filter(s => s.status === 'published').length}
              </div>
              <div className="text-sm text-gray-600">Published</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {surveys.reduce((sum, s) => sum + (s.responses_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Responses</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Surveys; 