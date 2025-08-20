import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Edit,
  Play,
  Save,
  Clock
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const DraftSurveys = () => {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updated_at');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  useEffect(() => {
    fetchDraftSurveys();
  }, []);

  const fetchDraftSurveys = async () => {
    try {
      const response = await axios.get('/api/surveys');
      const draftSurveys = response.data.filter(survey => survey.status === 'draft');
      setSurveys(draftSurveys);
    } catch (error) {
      console.error('Error fetching draft surveys:', error);
      toast.error('Failed to load draft surveys');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      await axios.post(`/api/surveys/${id}/publish`);
      toast.success('Survey published successfully!');
      fetchDraftSurveys();
    } catch (error) {
      console.error('Error publishing survey:', error);
      toast.error('Failed to publish survey');
    }
  };

  const handleArchive = async (id) => {
    if (window.confirm('Are you sure you want to archive this survey? It will be hidden from your active surveys.')) {
      try {
        await axios.patch(`/api/surveys/${id}`, { status: 'archived' });
        toast.success('Survey archived successfully');
        fetchDraftSurveys();
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
        fetchDraftSurveys();
      } catch (error) {
        console.error('Error deleting survey:', error);
        toast.error('Failed to delete survey');
      }
    }
  };

  const handleCopy = async (id) => {
    try {
      await axios.post(`/api/surveys/${id}/copy`);
      toast.success('Survey copied successfully');
      fetchDraftSurveys();
    } catch (error) {
      console.error('Error copying survey:', error);
      toast.error('Failed to copy survey');
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
        case 'created_at':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'updated_at':
          return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
        case 'questions':
          return (b.questions?.length || 0) - (a.questions?.length || 0);
        default:
          return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
      }
    });

  const getCompletionStatus = (questions) => {
    if (!questions || questions.length === 0) return 'empty';
    if (questions.length < 3) return 'incomplete';
    return 'complete';
  };

  const getCompletionColor = (status) => {
    switch (status) {
      case 'complete':
        return 'text-green-600 bg-green-100';
      case 'incomplete':
        return 'text-yellow-600 bg-yellow-100';
      case 'empty':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
          <span className="text-gray-600">Loading draft surveys...</span>
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
            <Edit className="h-6 w-6 text-yellow-600" />
            <h1 className="text-3xl font-bold text-gray-900">Draft Surveys</h1>
          </div>
          <p className="text-gray-600">Edit and prepare your surveys for publication</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchDraftSurveys}
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
                placeholder="Search draft surveys..."
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
              <option value="updated_at">Recently Modified</option>
              <option value="created_at">Newest First</option>
              <option value="title">Alphabetical</option>
              <option value="questions">Most Questions</option>
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
          <Edit className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {surveys.length === 0 ? 'No draft surveys yet' : 'No draft surveys match your search'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {surveys.length === 0 
              ? 'Create your first survey draft to start building your questionnaire'
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
          {filteredSurveys.map((survey) => {
            const completionStatus = getCompletionStatus(survey.questions);
            return (
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
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getCompletionColor(completionStatus)}`}>
                        <Edit className="h-3 w-3 mr-1" />
                        {completionStatus === 'complete' ? 'Ready' : completionStatus === 'incomplete' ? 'In Progress' : 'Empty'}
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
                      <Clock className="h-4 w-4" />
                      <span>{new Date(survey.updated_at || survey.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4">
                  {/* Primary Actions */}
                  <div className="flex space-x-2 mb-3">
                    <Link
                      to={`/builder/${survey.id}`}
                      className="flex-1 btn-secondary text-center"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                    <Link
                      to={`/preview/${survey.id}`}
                      className="flex-1 btn-secondary text-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Link>
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleCopy(survey.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                        title="Copy Survey"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex space-x-1">
                      {completionStatus === 'complete' && (
                        <button
                          onClick={() => handlePublish(survey.id)}
                          className="p-2 text-green-400 hover:text-green-600 transition-colors rounded-md hover:bg-green-50"
                          title="Publish Survey"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
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
            );
          })}
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Modified
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSurveys.map((survey) => {
                  const completionStatus = getCompletionStatus(survey.questions);
                  return (
                    <tr key={survey.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                              <Edit className="h-5 w-5 text-yellow-600" />
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCompletionColor(completionStatus)}`}>
                          {completionStatus === 'complete' ? 'Ready' : completionStatus === 'incomplete' ? 'In Progress' : 'Empty'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(survey.updated_at || survey.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/builder/${survey.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/preview/${survey.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleCopy(survey.id)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Copy"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          {completionStatus === 'complete' && (
                            <button
                              onClick={() => handlePublish(survey.id)}
                              className="text-green-400 hover:text-green-600"
                              title="Publish"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
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
                  );
                })}
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
              <div className="text-sm text-gray-600">Draft Surveys</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {surveys.filter(s => getCompletionStatus(s.questions) === 'complete').length}
              </div>
              <div className="text-sm text-gray-600">Ready to Publish</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {surveys.filter(s => getCompletionStatus(s.questions) === 'incomplete').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {surveys.filter(s => getCompletionStatus(s.questions) === 'empty').length}
              </div>
              <div className="text-sm text-gray-600">Empty Drafts</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftSurveys; 