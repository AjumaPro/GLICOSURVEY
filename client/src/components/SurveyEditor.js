import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Save, 
  Eye, 
  EyeOff,
  Play, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Copy, 
  FileText,
  XCircle,
  Type,
  List,
  Smile,
  BarChart3,
  Upload,
  GripVertical,
  Image
} from 'lucide-react';
import QuestionUpload from './QuestionUpload';
import EmojiScale, { emojiScaleTemplates } from './EmojiScale';

const SurveyEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState({
    title: 'Untitled Survey',
    description: '',
    status: 'draft'
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const questionTypes = [
    { type: 'emoji_scale', label: 'Emoji Scale', icon: Smile, color: 'text-yellow-600' },
    { type: 'multiple_choice', label: 'Multiple Choice', icon: List, color: 'text-blue-600' },
    { type: 'text', label: 'Text Input', icon: Type, color: 'text-green-600' },
    { type: 'likert_scale', label: 'Likert Scale', icon: BarChart3, color: 'text-purple-600' },
    { type: 'image_upload', label: 'Image Upload', icon: Image, color: 'text-orange-600' },
    { type: 'contact_followup', label: 'Comments & Phone Number', icon: Upload, color: 'text-indigo-600' }
  ];

  const fetchSurveyData = useCallback(async () => {
    try {
      const [surveyRes, questionsRes] = await Promise.all([
        axios.get(`/api/surveys/${id}`),
        axios.get(`/api/surveys/${id}/questions`)
      ]);

      setSurvey(surveyRes.data);
      
      // Convert backend question format to frontend format
      const formattedQuestions = questionsRes.data.map(q => ({
        id: q.id || Date.now() + Math.random(),
        type: q.question_type,
        title: q.question_text,
        description: q.description || '',
        options: q.options || [],
        required: q.required || false,
        order_index: q.order_index || 0,
        settings: q.settings || {},
        instructions: q.instructions || '',
        commentsPlaceholder: q.commentsPlaceholder || '',
        phonePlaceholder: q.phonePlaceholder || ''
      }));
      
      setQuestions(formattedQuestions);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      // Convert questions to the format expected by the backend
      const formattedQuestions = questions.map((q, index) => ({
        question_type: q.type,
        question_text: q.title,
        description: q.description || '',
        options: q.options || [],
        required: q.required || false,
        order_index: index,
        settings: q.settings || {},
        instructions: q.instructions || '',
        commentsPlaceholder: q.commentsPlaceholder || '',
        phonePlaceholder: q.phonePlaceholder || ''
      }));

      await axios.put(`/api/surveys/${id}`, {
        title: survey.title,
        description: survey.description,
        questions: formattedQuestions
      });
      
      toast.success('Survey saved successfully!');
    } catch (error) {
      console.error('Error saving survey:', error);
      toast.error('Failed to save survey');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!validateSurvey()) {
      toast.error('Please fix validation errors before publishing');
      return;
    }

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

  const validateSurvey = () => {
    if (!survey.title || survey.title.trim() === '') return false;
    if (questions.length === 0) return false;
    
    return questions.every(q => 
      q.title && q.title.trim() !== '' &&
      (!['emoji_scale', 'likert_scale', 'multiple_choice'].includes(q.type) || 
       (q.options && q.options.length > 0))
    );
  };

  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now(),
      type,
      title: '',
      description: '',
      required: false,
      options: type === 'emoji_scale' ? emojiScaleTemplates.satisfaction : 
               type === 'likert_scale' ? [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ] : [],
      settings: type === 'likert_scale' ? { min: 1, max: 5 } : {}
    };

    setQuestions([...questions, newQuestion]);
    setShowQuestionModal(false);
  };

  const updateQuestion = (questionId, updates) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    ));
  };

  const removeQuestion = (questionId) => {
    if (window.confirm('Are you sure you want to remove this question?')) {
      setQuestions(questions.filter(q => q.id !== questionId));
    }
  };

  const duplicateQuestion = (question) => {
    const duplicated = {
      ...question,
      id: Date.now(),
      title: `${question.title} (Copy)`
    };
    setQuestions([...questions, duplicated]);
  };

  const handleQuestionsUploaded = (uploadedQuestions) => {
    const questionsWithIds = uploadedQuestions.map((q, index) => ({
      ...q,
      id: Date.now() + index,
      order_index: questions.length + index
    }));
    setQuestions([...questions, ...questionsWithIds]);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setQuestions(items);
  };



  const getQuestionValidationStatus = (question) => {
    if (!question.title || question.title.trim() === '') {
      return { status: 'error', message: 'Question title is required' };
    }
    
    if (['emoji_scale', 'likert_scale', 'multiple_choice'].includes(question.type)) {
      if (!question.options || question.options.length === 0) {
        return { status: 'error', message: 'Options are required' };
      }
    }
    
    return { status: 'success', message: 'Valid' };
  };





  const renderQuestionEditor = (question) => {
    switch (question.type) {
      case 'emoji_scale':
        return <EmojiScaleEditor question={question} updateQuestion={updateQuestion} />;
      case 'multiple_choice':
        return <MultipleChoiceEditor question={question} updateQuestion={updateQuestion} />;
      case 'text':
        return <TextEditor question={question} updateQuestion={updateQuestion} />;
      case 'likert_scale':
        return <LikertScaleEditor question={question} updateQuestion={updateQuestion} />;
      case 'image_upload':
        return <ImageUploadEditor question={question} updateQuestion={updateQuestion} />;
      case 'contact_followup':
        return <ContactFollowupEditor question={question} updateQuestion={updateQuestion} />;
      default:
        return <div>Question type not supported</div>;
    }
  };

  const renderQuestionPreview = (question) => {
    switch (question.type) {
      case 'emoji_scale':
        return (
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">{question.title}</h4>
            <EmojiScale options={question.options} />
          </div>
        );
      case 'multiple_choice':
        return (
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">{question.title}</h4>
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <label key={index} className="flex items-center">
                  <input type="radio" name={`question-${question.id}`} className="mr-2" />
                  <span>{typeof option === 'object' ? option.label || option.value : option}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 'text':
        return (
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">{question.title}</h4>
            <textarea className="w-full p-2 border rounded" rows="3" placeholder="Your answer..." />
          </div>
        );
      case 'likert_scale':
        return (
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">{question.title}</h4>
            <div className="flex justify-center space-x-4">
              {question.options?.map((option, index) => (
                <label key={index} className="flex flex-col items-center">
                  <input
                    type="radio"
                    name={`preview-${question.id}`}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="mt-1 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 'image_upload':
        return (
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">{question.title}</h4>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload image</p>
              {question.instructions && (
                <p className="text-xs text-gray-500 mt-1">{question.instructions}</p>
              )}
            </div>
          </div>
        );
      case 'contact_followup':
        return (
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">{question.title}</h4>
            <div className="space-y-3">
              <textarea 
                className="w-full p-2 border rounded" 
                rows="3" 
                placeholder={question.commentsPlaceholder || "We would love to hear from you, please provide your comments. (Optional)"} 
              />
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 px-2 py-1 border rounded bg-gray-50">
                  <span className="text-sm">🇬🇭</span>
                  <span className="text-sm">+233</span>
                </div>
                <input 
                  type="tel" 
                  className="flex-1 p-2 border rounded" 
                  placeholder={question.phonePlaceholder || "Phone number"} 
                />
              </div>
            </div>
          </div>
        );
      default:
        return <div>Preview not available</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="text-gray-600">Loading survey editor...</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Survey Editor</h1>
            <p className="text-gray-600">Build and customize your survey</p>
            {survey?.status && (
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  survey.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : survey.status === 'draft' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`btn-secondary ${previewMode ? 'bg-primary-100 text-primary-700' : ''}`}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Exit Preview' : 'Preview'}
          </button>
          <button
            onClick={handleDuplicate}
            className="btn-secondary"
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-secondary"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          {survey?.status === 'published' ? (
            <button
              onClick={handleUnpublish}
              className="btn-primary bg-yellow-600 hover:bg-yellow-700"
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Unpublish
            </button>
          ) : validateSurvey() ? (
            <button
              onClick={handlePublish}
              className="btn-primary bg-green-600 hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Publish
            </button>
          ) : null}
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
              <h3 className="text-sm font-medium text-yellow-900 mb-1">Editing Published Survey</h3>
              <p className="text-sm text-yellow-700">
                This survey is currently published and accessible to respondents. 
                Changes you make will be saved but won't affect responses already submitted. 
                You can unpublish the survey to make it inaccessible to new respondents.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Survey Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Survey Title *</label>
            <input
              type="text"
              value={survey.title}
              onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
              className="input w-full"
              placeholder="Enter survey title"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={survey.description || ''}
              onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
              className="input w-full"
              rows={3}
              placeholder="Enter survey description"
            />
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Questions ({questions.length})
            </h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-secondary"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Questions
              </button>
              <button
                onClick={() => setShowQuestionModal(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </button>
            </div>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-600 mb-4">Start building your survey by adding questions</p>
            <button
              onClick={() => setShowQuestionModal(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Question
            </button>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {questions.map((question, index) => (
                    <Draggable key={question.id} draggableId={question.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                            snapshot.isDragging ? 'bg-blue-50 shadow-lg' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            {/* Drag Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="flex-shrink-0 flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 cursor-grab"
                            >
                              <GripVertical className="h-5 w-5" />
                            </div>

                            {/* Question Number */}
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                            </div>

                            {/* Question Content */}
                            <div className="flex-1">
                              {previewMode ? (
                                renderQuestionPreview(question)
                              ) : (
                                renderQuestionEditor(question)
                              )}
                            </div>

                            {/* Question Actions */}
                            <div className="flex-shrink-0 flex items-center space-x-2">
                              <button
                                onClick={() => duplicateQuestion(question)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Duplicate question"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => removeQuestion(question.id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete question"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Survey Validation Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Survey Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{questions.length}</div>
            <div className="text-sm text-gray-600">Total Questions</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {questions.filter(q => getQuestionValidationStatus(q).status === 'success').length}
            </div>
            <div className="text-sm text-gray-600">Valid Questions</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${
              validateSurvey() ? 'text-green-600' : 'text-red-600'
            }`}>
              {validateSurvey() ? 'Ready' : 'Not Ready'}
            </div>
            <div className="text-sm text-gray-600">Publish Status</div>
          </div>
        </div>
      </div>

      {/* Add Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Question</h3>
            <div className="space-y-3">
              {questionTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.type}
                    onClick={() => addQuestion(type.type)}
                    className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <Icon className={`h-5 w-5 mr-3 ${type.color}`} />
                    <span className="text-left">{type.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowQuestionModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Upload Questions</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <QuestionUpload
              onQuestionsUploaded={handleQuestionsUploaded}
              onClose={() => setShowUploadModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Question Editor Components
const EmojiScaleEditor = ({ question, updateQuestion }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('satisfaction');

  const handleTemplateChange = (templateName) => {
    setSelectedTemplate(templateName);
    updateQuestion(question.id, { options: emojiScaleTemplates[templateName] });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Question Title</label>
        <input
          type="text"
          value={question.title}
          onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
          className="input mt-1"
          placeholder="Enter question title"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
        <textarea
          value={question.description}
          onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
          className="input mt-1"
          rows="2"
          placeholder="Enter question description"
        />
            </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Template</label>
        <select
          value={selectedTemplate}
          onChange={(e) => handleTemplateChange(e.target.value)}
          className="input mt-1"
        >
          <option value="satisfaction">Satisfaction Scale</option>
          <option value="agreement">Agreement Scale</option>
          <option value="quality">Quality Rating</option>
          <option value="thumbs">Thumbs Up/Down</option>
          <option value="recommendation_5">Recommendation (1-5)</option>
          <option value="recommendation_10">Recommendation (1-10) - SVG</option>
          <option value="ease_of_interaction">Ease of Interaction</option>
          <option value="customer_satisfaction">Customer Satisfaction</option>
          <option value="service_quality">Service Quality</option>
        </select>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id={`required-${question.id}`}
          checked={question.required}
          onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
          className="mr-2"
        />
        <label htmlFor={`required-${question.id}`} className="text-sm text-gray-700">
          Required question
        </label>
      </div>
      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
        <EmojiScale options={question.options} />
      </div>
    </div>
  );
};

const MultipleChoiceEditor = ({ question, updateQuestion }) => {
  const [newOption, setNewOption] = useState('');

  const addOption = () => {
    if (newOption.trim()) {
    updateQuestion(question.id, {
        options: [...(question.options || []), newOption.trim()]
      });
      setNewOption('');
    }
  };

  const removeOption = (index) => {
    const newOptions = question.options.filter((_, i) => i !== index);
    updateQuestion(question.id, { options: newOptions });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Question Title</label>
        <input
          type="text"
          value={question.title}
          onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
          className="input mt-1"
          placeholder="Enter question title"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Options</label>
        <div className="space-y-2">
          {(question.options || []).map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={typeof option === 'object' ? option.label || option.value || '' : option}
                onChange={(e) => {
                  const newOptions = [...question.options];
                  newOptions[index] = e.target.value;
                  updateQuestion(question.id, { options: newOptions });
                }}
                className="input flex-1"
              />
              <button
                onClick={() => removeOption(index)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addOption()}
              className="input flex-1"
              placeholder="Add new option"
            />
            <button onClick={addOption} className="btn-primary px-3 py-1">
              Add
        </button>
      </div>
        </div>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id={`required-${question.id}`}
          checked={question.required}
          onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
          className="mr-2"
        />
        <label htmlFor={`required-${question.id}`} className="text-sm text-gray-700">
          Required question
        </label>
      </div>
    </div>
  );
};

const TextEditor = ({ question, updateQuestion }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Question Title</label>
        <input
          type="text"
          value={question.title}
          onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
          className="input mt-1"
          placeholder="Enter question title"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
        <textarea
          value={question.description}
          onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
          className="input mt-1"
          rows="2"
          placeholder="Enter question description"
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id={`required-${question.id}`}
          checked={question.required}
          onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
          className="mr-2"
        />
        <label htmlFor={`required-${question.id}`} className="text-sm text-gray-700">
          Required question
        </label>
      </div>
    </div>
  );
};

const LikertScaleEditor = ({ question, updateQuestion }) => {
  // Ensure question.settings exists with defaults
  const settings = question.settings || {};
  const min = settings.min || 1;
  const max = settings.max || 5;
  
  const generateOptions = (min, max) => {
    const options = [];
    for (let i = min; i <= max; i++) {
      options.push({ value: i, label: i.toString() });
    }
    return options;
  };

  const updateSettings = (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    updateQuestion(question.id, { 
      settings: updatedSettings,
      options: generateOptions(updatedSettings.min || min, updatedSettings.max || max)
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Question Title</label>
        <input
          type="text"
          value={question.title}
          onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
          className="input mt-1"
          placeholder="Enter question title"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
        <textarea
          value={question.description}
          onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
          className="input mt-1"
          rows="2"
          placeholder="Enter question description"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Minimum Value</label>
          <input
            type="number"
            value={min}
            onChange={(e) => updateSettings({ min: parseInt(e.target.value) })}
            className="input mt-1"
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Maximum Value</label>
          <input
            type="number"
            value={max}
            onChange={(e) => updateSettings({ max: parseInt(e.target.value) })}
            className="input mt-1"
            min="2"
          />
        </div>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id={`required-${question.id}`}
          checked={question.required}
          onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
          className="mr-2"
        />
        <label htmlFor={`required-${question.id}`} className="text-sm text-gray-700">
          Required question
        </label>
      </div>
      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">{question.title}</h4>
          <div className="flex justify-center space-x-4">
            {question.options?.map((option, index) => (
              <label key={index} className="flex flex-col items-center">
                <input
                  type="radio"
                  name={`preview-${question.id}`}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="mt-1 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactFollowupEditor = ({ question, updateQuestion }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Section Title</label>
        <input
          type="text"
          value={question.title}
          onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
          className="input mt-1"
          placeholder="Enter section title"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Comments Placeholder</label>
        <input
          type="text"
          value={question.commentsPlaceholder || ''}
          onChange={(e) => updateQuestion(question.id, { commentsPlaceholder: e.target.value })}
          className="input mt-1"
          placeholder="We would love to hear from you, please provide your comments. (Optional)"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Placeholder</label>
        <input
          type="text"
          value={question.phonePlaceholder || ''}
          onChange={(e) => updateQuestion(question.id, { phonePlaceholder: e.target.value })}
          className="input mt-1"
          placeholder="Phone number"
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id={`required-${question.id}`}
          checked={question.required}
          onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
          className="mr-2"
        />
        <label htmlFor={`required-${question.id}`} className="text-sm text-gray-700">
          Required question
        </label>
      </div>
      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">{question.title}</h4>
          <div className="space-y-3">
            <textarea 
              className="w-full p-2 border rounded" 
              rows="3" 
              placeholder={question.commentsPlaceholder || "We would love to hear from you, please provide your comments. (Optional)"} 
            />
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 px-2 py-1 border rounded bg-gray-50">
                <span className="text-sm">🇬🇭</span>
                <span className="text-sm">+233</span>
              </div>
              <input 
                type="tel" 
                className="flex-1 p-2 border rounded" 
                placeholder={question.phonePlaceholder || "Phone number"} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImageUploadEditor = ({ question, updateQuestion }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text
        </label>
        <input
          type="text"
          value={question.title || ''}
          onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
          className="input w-full"
          placeholder="Enter your question"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Instructions (Optional)
        </label>
        <input
          type="text"
          value={question.instructions || ''}
          onChange={(e) => updateQuestion(question.id, { instructions: e.target.value })}
          className="input w-full"
          placeholder="e.g., Please upload a clear photo of your receipt"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={`required-${question.id}`}
          checked={question.required || false}
          onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor={`required-${question.id}`} className="text-sm text-gray-700">
          Required question
        </label>
      </div>
    </div>
  );
};

export default SurveyEditor;
