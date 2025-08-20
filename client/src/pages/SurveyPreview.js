import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Eye,
  Edit,
  BarChart3,
  Copy,
  Trash2,
  Calendar,
  Users,
  FileText,
  CheckCircle,
  Clock,
  Settings,
  ArrowLeft,
  Play,
  Pause,
  Globe,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmojiScale from '../components/EmojiScale';

const SurveyPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState('preview'); // 'preview' or 'response'
  const [responses, setResponses] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const fetchSurvey = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/surveys/${id}`);
      setSurvey(response.data);
      
      // Initialize responses for preview mode
      const initialResponses = {};
      response.data.questions.forEach(question => {
        initialResponses[question.id] = null;
      });
      setResponses(initialResponses);
    } catch (error) {
      console.error('Error fetching survey:', error);
      toast.error('Survey not found');
      navigate('/surveys');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchSurvey();
  }, [fetchSurvey]);

  const handleResponse = (questionId, answer) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const duplicateSurvey = async () => {
    try {
      const response = await axios.post(`/api/surveys/${id}/duplicate`);
      toast.success('Survey duplicated successfully');
      navigate(`/preview/${response.data.id}`);
    } catch (error) {
      console.error('Error duplicating survey:', error);
      toast.error('Failed to duplicate survey');
    }
  };

  const deleteSurvey = async () => {
    if (!window.confirm('Are you sure you want to delete this survey?')) return;
    
    try {
      await axios.delete(`/api/surveys/${id}`);
      toast.success('Survey deleted successfully');
      navigate('/surveys');
    } catch (error) {
      console.error('Error deleting survey:', error);
      toast.error('Failed to delete survey');
    }
  };

  const publishSurvey = async () => {
    try {
      await axios.post(`/api/surveys/${id}/publish`);
      setSurvey({ ...survey, status: 'published' });
      toast.success('Survey published successfully');
    } catch (error) {
      console.error('Error publishing survey:', error);
      toast.error('Failed to publish survey');
    }
  };

  const unpublishSurvey = async () => {
    try {
      await axios.post(`/api/surveys/${id}/unpublish`);
      setSurvey({ ...survey, status: 'draft' });
      toast.success('Survey unpublished successfully');
    } catch (error) {
      console.error('Error unpublishing survey:', error);
      toast.error('Failed to unpublish survey');
    }
  };

  const renderQuestionContent = (question) => {
    const currentResponse = responses[question.id];

    switch (question.type) {
      case 'emoji_scale':
      case 'likert_scale':
        return (
          <div className="space-y-4">
            <EmojiScale
              options={question.options}
              value={currentResponse}
              onChange={(value) => handleResponse(question.id, value)}
            />
            {currentResponse && (
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <p className="text-primary-700 font-medium">
                  Selected: {question.options.find(opt => opt.value === currentResponse)?.label}
                </p>
              </div>
            )}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label
                key={index}
                className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.value || option}
                  checked={currentResponse === (option.value || option)}
                  onChange={(e) => handleResponse(question.id, e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center">
                  {currentResponse === (option.value || option) ? (
                    <CheckCircle className="h-5 w-5 text-primary-600 mr-3" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-400 mr-3" />
                  )}
                  <span className="text-gray-900">{option.label || option}</span>
                </div>
              </label>
            ))}
          </div>
        );

      case 'text':
        return (
          <div>
            <textarea
              value={currentResponse || ''}
              onChange={(e) => handleResponse(question.id, e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              rows="4"
              placeholder="Enter your answer here..."
            />
          </div>
        );

      case 'phone':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <select 
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                defaultValue="+233"
              >
                <option value="+233">🇬🇭 +233</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+91">🇮🇳 +91</option>
                <option value="+86">🇨🇳 +86</option>
              </select>
              <input
                type="tel"
                value={currentResponse || ''}
                onChange={(e) => handleResponse(question.id, e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter phone number"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Question type not supported</p>
          </div>
        );
    }
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

  const currentQuestion = survey.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / survey.questions.length) * 100;

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
                <h1 className="text-3xl font-bold text-gray-900">{survey.title}</h1>
                <p className="text-gray-600 mt-1">{survey.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${
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
          </div>

          {/* Survey Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <div className="text-lg font-bold text-gray-900">{survey.questions?.length || 0}</div>
                  <div className="text-sm text-gray-500">Questions</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <div className="text-lg font-bold text-gray-900">{survey.responses_count || 0}</div>
                  <div className="text-sm text-gray-500">Responses</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(survey.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">Created</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-orange-600 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {survey.updated_at ? new Date(survey.updated_at).toLocaleDateString() : 'Never'}
                  </div>
                  <div className="text-sm text-gray-500">Updated</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setPreviewMode('preview')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  previewMode === 'preview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Eye className="h-4 w-4 mr-2 inline" />
                Preview
              </button>
              <button
                onClick={() => setPreviewMode('response')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  previewMode === 'response'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Play className="h-4 w-4 mr-2 inline" />
                Response Mode
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to={`/builder/${survey.id}`}
                className="btn-secondary"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
              <Link
                to={`/analytics/${survey.id}`}
                className="btn-secondary"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Link>
              <button
                onClick={duplicateSurvey}
                className="btn-secondary"
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </button>
              {survey.status === 'published' ? (
                <button
                  onClick={unpublishSurvey}
                  className="btn-secondary"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Unpublish
                </button>
              ) : (
                <button
                  onClick={publishSurvey}
                  className="btn-primary"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Publish
                </button>
              )}
              <button
                onClick={deleteSurvey}
                className="btn-secondary text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </motion.div>

        {/* Survey Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {previewMode === 'response' ? (
            /* Response Mode - Interactive Survey */
            <div className="p-8">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Question {currentQuestionIndex + 1} of {survey.questions.length}
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Question */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {currentQuestion.title}
                </h2>
                {currentQuestion.description && (
                  <p className="text-gray-600 mb-6">{currentQuestion.description}</p>
                )}
                {renderQuestionContent(currentQuestion)}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center space-x-2">
                  {survey.questions.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        index === currentQuestionIndex
                          ? 'bg-blue-600'
                          : index < currentQuestionIndex
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    ></div>
                  ))}
                </div>
                <button
                  onClick={nextQuestion}
                  disabled={currentQuestionIndex === survey.questions.length - 1}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            /* Preview Mode - Static View */
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Survey Preview</h2>
                <p className="text-gray-600">This is how your survey will appear to respondents.</p>
              </div>

              <div className="space-y-8">
                {survey.questions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Question {index + 1}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {question.type.replace('_', ' ')}
                        </span>
                        {question.required && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {question.title}
                      </h4>
                      {question.description && (
                        <p className="text-gray-600">{question.description}</p>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      {renderQuestionContent(question)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Public Link Section */}
        {survey.status === 'published' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 bg-white rounded-lg p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Public Survey Link</h3>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={`${window.location.origin}/survey/${survey.id}`}
                readOnly
                className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/survey/${survey.id}`);
                  toast.success('Link copied to clipboard');
                }}
                className="btn-secondary"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </button>
              <Link
                to={`/survey/${survey.id}`}
                target="_blank"
                className="btn-primary"
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SurveyPreview; 