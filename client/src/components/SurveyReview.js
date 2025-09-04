import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Edit3, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Play,
  Save,
  Trash2,
  Copy,
  FileText,
  AlertTriangle,
  EyeOff
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SurveyReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [reviewData, setReviewData] = useState({
    title: '',
    description: '',
    questions: []
  });

  const fetchSurveyData = useCallback(async () => {
    try {
      const [surveyRes, questionsRes] = await Promise.all([
        axios.get(`/api/surveys/${id}`),
        axios.get(`/api/surveys/${id}/questions`)
      ]);

      setSurvey(surveyRes.data);
      setReviewData({
        title: surveyRes.data.title,
        description: surveyRes.data.description,
        questions: questionsRes.data
      });
    } catch (error) {
      console.error('Error fetching survey data:', error);
      toast.error('Failed to load survey data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSurveyData();
  }, [fetchSurveyData]);

  const handleSaveChanges = async () => {
    try {
      await axios.put(`/api/surveys/${id}`, {
        title: reviewData.title,
        description: reviewData.description,
        questions: reviewData.questions
      });
      
      toast.success('Survey updated successfully!');
      setEditMode(false);
      fetchSurveyData();
    } catch (error) {
      console.error('Error updating survey:', error);
      toast.error('Failed to update survey');
    }
  };

  const handlePublish = async () => {
    try {
      await axios.post(`/api/surveys/${id}/publish`);
      toast.success('Survey published successfully!');
      navigate('/surveys');
    } catch (error) {
      console.error('Error publishing survey:', error);
      toast.error('Failed to publish survey');
    }
  };

  const handleUnpublish = async () => {
    if (window.confirm('Are you sure you want to unpublish this survey? It will no longer be accessible to respondents.')) {
      try {
        await axios.post(`/api/surveys/${id}/unpublish`);
        toast.success('Survey unpublished successfully!');
        // Refresh survey data to update status
        fetchSurveyData();
      } catch (error) {
        console.error('Error unpublishing survey:', error);
        toast.error('Failed to unpublish survey');
      }
    }
  };

  const handleDuplicate = async () => {
    try {
      await axios.post(`/api/surveys/${id}/copy`);
      toast.success('Survey duplicated successfully!');
      navigate('/surveys');
    } catch (error) {
      console.error('Error duplicating survey:', error);
      toast.error('Failed to duplicate survey');
    }
  };

  const getQuestionValidationStatus = (question) => {
    if (!question.question_text || question.question_text.trim() === '') {
      return { status: 'error', message: 'Question text is required' };
    }
    
    if (['radio', 'checkbox', 'select', 'emoji', 'rating', 'scale'].includes(question.question_type)) {
      if (!question.options || question.options.length === 0) {
        return { status: 'error', message: 'Options are required for this question type' };
      }
    }
    
    return { status: 'success', message: 'Question is valid' };
  };

  const getOverallValidationStatus = () => {
    if (!reviewData.title || reviewData.title.trim() === '') {
      return { status: 'error', message: 'Survey title is required' };
    }
    
    if (reviewData.questions.length === 0) {
      return { status: 'error', message: 'At least one question is required' };
    }
    
    const invalidQuestions = reviewData.questions.filter(q => 
      getQuestionValidationStatus(q).status === 'error'
    );
    
    if (invalidQuestions.length > 0) {
      return { status: 'warning', message: `${invalidQuestions.length} question(s) need attention` };
    }
    
    return { status: 'success', message: 'Survey is ready to publish' };
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...reviewData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setReviewData({ ...reviewData, questions: updatedQuestions });
  };

  const addQuestion = () => {
    const newQuestion = {
      question_type: 'text',
      question_text: '',
      required: false,
      options: [],
      order_index: reviewData.questions.length
    };
    setReviewData({
      ...reviewData,
      questions: [...reviewData.questions, newQuestion]
    });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = reviewData.questions.filter((_, i) => i !== index);
    setReviewData({ ...reviewData, questions: updatedQuestions });
  };

  const moveQuestion = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === reviewData.questions.length - 1) return;
    
    const updatedQuestions = [...reviewData.questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [updatedQuestions[index], updatedQuestions[newIndex]] = 
    [updatedQuestions[newIndex], updatedQuestions[index]];
    
    // Update order_index
    updatedQuestions.forEach((q, i) => { q.order_index = i; });
    
    setReviewData({ ...reviewData, questions: updatedQuestions });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="text-gray-600">Loading survey review...</span>
        </div>
      </div>
    );
  }

  const validationStatus = getOverallValidationStatus();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
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
            <h1 className="text-3xl font-bold text-gray-900">Survey Review</h1>
            <p className="text-gray-600">Review and finalize your survey before publishing</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {editMode ? (
            <>
              <button
                onClick={() => setEditMode(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="btn-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="btn-secondary"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Survey
              </button>
              <button
                onClick={handleDuplicate}
                className="btn-secondary"
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </button>
              {survey?.status === 'published' ? (
                <button
                  onClick={handleUnpublish}
                  className="btn-primary bg-yellow-600 hover:bg-yellow-700"
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Unpublish Survey
                </button>
              ) : validationStatus.status === 'success' ? (
                <button
                  onClick={handlePublish}
                  className="btn-primary"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Publish Survey
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* Published Survey Warning */}
      {survey?.status === 'published' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">⚠</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-900 mb-1">Published Survey</h3>
              <p className="text-sm text-yellow-700">
                This survey is currently published and accessible to respondents. 
                You can review and edit it, but changes won't affect responses already submitted. 
                Use the Unpublish button to make it inaccessible to new respondents.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Validation Status */}
      <div className={`p-4 rounded-lg border ${
        validationStatus.status === 'success' ? 'bg-green-50 border-green-200' :
        validationStatus.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
        'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center space-x-3">
          {validationStatus.status === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : validationStatus.status === 'warning' ? (
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <div>
            <h3 className={`font-medium ${
              validationStatus.status === 'success' ? 'text-green-800' :
              validationStatus.status === 'warning' ? 'text-yellow-800' :
              'text-red-800'
            }`}>
              {validationStatus.status === 'success' ? 'Ready to Publish' :
               validationStatus.status === 'warning' ? 'Needs Attention' :
               'Cannot Publish'}
            </h3>
            <p className={`text-sm ${
              validationStatus.status === 'success' ? 'text-green-700' :
              validationStatus.status === 'warning' ? 'text-yellow-700' :
              'text-red-700'
            }`}>
              {validationStatus.message}
            </p>
          </div>
        </div>
      </div>

      {/* Survey Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Survey Title</label>
            {editMode ? (
              <input
                type="text"
                value={reviewData.title}
                onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                className="input w-full"
                placeholder="Enter survey title"
              />
            ) : (
              <p className="text-gray-900 font-medium">{survey.title}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            {editMode ? (
              <textarea
                value={reviewData.description}
                onChange={(e) => setReviewData({ ...reviewData, description: e.target.value })}
                className="input w-full"
                rows={3}
                placeholder="Enter survey description"
              />
            ) : (
              <p className="text-gray-600">{survey.description || 'No description'}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                survey.status === 'published' ? 'bg-green-100 text-green-800' :
                survey.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {survey.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Review */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Questions ({reviewData.questions.length})</h2>
            {editMode && (
              <button
                onClick={addQuestion}
                className="btn-secondary"
              >
                <FileText className="h-4 w-4 mr-2" />
                Add Question
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {reviewData.questions.map((question, index) => {
            const questionValidation = getQuestionValidationStatus(question);
            
            return (
              <div key={index} className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Question Number */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1 space-y-4">
                    {/* Question Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {editMode ? (
                          <input
                            type="text"
                            value={question.question_text}
                            onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                            className="input w-full text-lg font-medium"
                            placeholder="Enter your question"
                          />
                        ) : (
                          <h3 className="text-lg font-medium text-gray-900">{question.question_text}</h3>
                        )}
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="capitalize">{question.question_type}</span>
                          {question.required && (
                            <span className="text-red-600 font-medium">Required</span>
                          )}
                        </div>
                      </div>

                      {editMode && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => moveQuestion(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveQuestion(index, 'down')}
                            disabled={index === reviewData.questions.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => removeQuestion(index)}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Question Options */}
                    {['radio', 'checkbox', 'select', 'emoji', 'rating', 'scale'].includes(question.question_type) && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Options</label>
                        {question.options && question.options.length > 0 ? (
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">{optIndex + 1}.</span>
                                <span className="text-sm text-gray-900">
                                  {option.label || option.text || `Option ${optIndex + 1}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No options defined</p>
                        )}
                      </div>
                    )}

                    {/* Validation Status */}
                    <div className={`flex items-center space-x-2 text-sm ${
                      questionValidation.status === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {questionValidation.status === 'success' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <span>{questionValidation.message}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {reviewData.questions.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-600 mb-4">Add questions to your survey to get started</p>
            {editMode && (
              <button
                onClick={addQuestion}
                className="btn-primary"
              >
                <FileText className="h-4 w-4 mr-2" />
                Add Your First Question
              </button>
            )}
          </div>
        )}
      </div>

      {/* Survey Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Survey Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{reviewData.questions.length}</div>
            <div className="text-sm text-gray-600">Total Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {reviewData.questions.filter(q => q.required).length}
            </div>
            <div className="text-sm text-gray-600">Required Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {reviewData.questions.filter(q => ['radio', 'checkbox', 'select'].includes(q.question_type)).length}
            </div>
            <div className="text-sm text-gray-600">Choice Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {reviewData.questions.filter(q => ['emoji', 'rating', 'scale'].includes(q.question_type)).length}
            </div>
            <div className="text-sm text-gray-600">Rating Questions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyReview;
