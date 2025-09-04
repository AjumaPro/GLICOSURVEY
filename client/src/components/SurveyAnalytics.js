import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  BarChart3, 
  Users, 
  Clock, 
  Filter,
  RefreshCw,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Smile,
  BarChart,
  Grid
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SurveyAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchAnalyticsData();
  }, [id]);

  const fetchAnalyticsData = async () => {
    try {
      const [surveyRes, questionsRes, responsesRes, analyticsRes] = await Promise.all([
        axios.get(`/api/surveys/${id}`),
        axios.get(`/api/surveys/${id}/questions`),
        axios.get(`/api/responses/survey/${id}`),
        axios.get(`/api/analytics/survey/${id}`)
      ]);

      setSurvey(surveyRes.data);
      setQuestions(questionsRes.data);
      setResponses(responsesRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getQuestionTypeIcon = (questionType) => {
    switch (questionType) {
      case 'text':
      case 'textarea':
        return FileText;
      case 'radio':
      case 'checkbox':
      case 'select':
        return BarChart3;
      case 'emoji':
        return Smile;
      case 'rating':
        return Star;
      case 'scale':
        return BarChart;
      case 'matrix':
        return Grid;
      default:
        return FileText;
    }
  };

  const getResponseCount = (questionId) => {
    return responses.filter(r => 
      r.question_id === questionId && 
      r.response_value && 
      r.response_value.trim() !== ''
    ).length;
  };

  const getCompletionRate = () => {
    if (responses.length === 0) return 0;
    
    const totalPossibleResponses = questions.length * responses.length;
    const actualResponses = responses.reduce((total, response) => {
      return total + (response.response_value ? 1 : 0);
    }, 0);
    
    return Math.round((actualResponses / totalPossibleResponses) * 100);
  };

  const getAverageTime = () => {
    if (responses.length === 0) return 0;
    
    const totalTime = responses.reduce((total, response) => {
      return total + (response.response_time || 0);
    }, 0);
    
    return Math.round(totalTime / responses.length);
  };

  const getQuestionAnalytics = (question) => {
    const questionResponses = responses.filter(r => r.question_id === question.id);
    
    if (['radio', 'checkbox', 'select', 'emoji', 'rating', 'scale'].includes(question.question_type)) {
      const optionCounts = {};
      question.options?.forEach(option => {
        optionCounts[option.value] = 0;
      });
      
      questionResponses.forEach(response => {
        if (response.response_value) {
          const values = question.question_type === 'checkbox' 
            ? JSON.parse(response.response_value) 
            : [response.response_value];
          
          values.forEach(value => {
            if (optionCounts[value] !== undefined) {
              optionCounts[value]++;
            }
          });
        }
      });
      
      return optionCounts;
    }
    
    return null;
  };

  const exportData = () => {
    const csvData = [
      ['Question', 'Response', 'Timestamp', 'Session ID'],
      ...responses.map(r => [
        questions.find(q => q.id === r.question_id)?.question_text || 'Unknown',
        r.response_value || '',
        r.created_at || '',
        r.session_id || ''
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-${id}-responses.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Survey Analytics</h1>
            <p className="text-gray-600">Analyze responses and insights for "{survey.title}"</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAnalyticsData}
            className="btn-secondary"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={exportData}
            className="btn-secondary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Responses</p>
              <p className="text-2xl font-bold text-gray-900">{responses.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{getCompletionRate()}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Time</p>
              <p className="text-2xl font-bold text-gray-900">{getAverageTime()}s</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Questions</p>
              <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="input w-full"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Response Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input w-full"
            >
              <option value="all">All Responses</option>
              <option value="completed">Completed</option>
              <option value="partial">Partial</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={fetchAnalyticsData}
              className="btn-secondary w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Question-by-Question Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Question Analysis</h2>
          <p className="text-gray-600">Detailed breakdown of responses for each question</p>
        </div>

        <div className="divide-y divide-gray-200">
          {questions.map((question, index) => {
            const QuestionTypeIcon = getQuestionTypeIcon(question.question_type);
            const responseCount = getResponseCount(question.id);
            const responseRate = responses.length > 0 ? Math.round((responseCount / responses.length) * 100) : 0;
            const questionAnalytics = getQuestionAnalytics(question);
            
            return (
              <div key={question.id} className="p-6">
                <div className="space-y-4">
                  {/* Question Header */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <QuestionTypeIcon className="h-5 w-5 text-primary-600" />
                        <span className="text-sm font-medium text-gray-500 capitalize">
                          {question.question_type}
                        </span>
                        {question.required && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Required
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {question.question_text}
                      </h3>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{responseCount} responses</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <BarChart3 className="h-4 w-4" />
                          <span>{responseRate}% response rate</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Question Options and Analytics */}
                  {['radio', 'checkbox', 'select', 'emoji', 'rating', 'scale'].includes(question.question_type) && question.options && (
                    <div className="ml-14 space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Response Distribution</h4>
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => {
                          const count = questionAnalytics?.[option.value] || 0;
                          const percentage = responseCount > 0 ? Math.round((count / responseCount) * 100) : 0;
                          
                          return (
                            <div key={optIndex} className="flex items-center space-x-3">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-900">
                                    {option.label || option.text || `Option ${optIndex + 1}`}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {count} ({percentage}%)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Text Response Preview */}
                  {['text', 'textarea', 'email', 'number'].includes(question.question_type) && (
                    <div className="ml-14 space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Recent Responses</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {responses
                          .filter(r => r.question_id === question.id && r.response_value)
                          .slice(0, 5)
                          .map((response, respIndex) => (
                            <div key={respIndex} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              "{response.response_value}"
                            </div>
                          ))}
                        {responses.filter(r => r.question_id === question.id && r.response_value).length === 0 && (
                          <p className="text-sm text-gray-500 italic">No responses yet</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Response Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Timeline</h3>
        <div className="space-y-4">
          {responses.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {responses
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 20)
                .map((response, index) => {
                  const question = questions.find(q => q.id === response.question_id);
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {question?.question_text || 'Unknown Question'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Response: {response.response_value || 'No response'}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(response.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
              <p className="text-gray-600">Share your survey to start collecting responses</p>
            </div>
          )}
        </div>
      </div>

      {/* Export and Share */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export & Share</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Data Export</h4>
            <div className="space-y-2">
              <button
                onClick={exportData}
                className="btn-secondary w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
              <p className="text-xs text-gray-500">
                Download all responses in CSV format for further analysis
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Survey Sharing</h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const shareUrl = `${window.location.origin}/survey/${id}`;
                  navigator.clipboard.writeText(shareUrl);
                  toast.success('Survey URL copied to clipboard!');
                }}
                className="btn-secondary w-full"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Copy Survey URL
              </button>
              <p className="text-xs text-gray-500">
                Share the direct link to your survey
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyAnalytics;
