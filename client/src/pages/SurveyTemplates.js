import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Star, 
  Users, 
  ShoppingCart, 
  Calendar, 
  Globe,
  ArrowRight,
  Sparkles,
  Edit,
  Copy,
  Trash2,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

const SurveyTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customizedTemplate, setCustomizedTemplate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/templates');
      console.log('Templates fetched:', response.data);
      console.log('First template questions:', response.data[0]?.questions);
      console.log('Number of templates:', response.data.length);
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const createFromTemplate = async (templateId, template) => {
    setCreating(true);
    try {
      // Use databaseId for API calls, fallback to id if databaseId doesn't exist
      const apiId = template.databaseId || template.id;
      const response = await axios.post(`/api/templates/${apiId}/create`, {
        title: template.title,
        description: template.description
      });
      
      toast.success('Survey created successfully!');
      navigate(`/builder/${response.data.surveyId}`);
    } catch (error) {
      console.error('Error creating survey from template:', error);
      toast.error('Failed to create survey from template');
    } finally {
      setCreating(false);
    }
  };

  const duplicateTemplate = async (templateId, template) => {
    try {
      // Use databaseId for API calls, fallback to id if databaseId doesn't exist
      const apiId = template.databaseId || template.id;
      await axios.post(`/api/templates/${apiId}/duplicate`, {
        title: `${template.title} (Copy)`,
        description: template.description
      });
      
      toast.success('Template duplicated successfully!');
      fetchTemplates(); // Refresh the list
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
    }
  };

  const deleteTemplate = async (templateId, template) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      // Use databaseId for API calls, fallback to id if databaseId doesn't exist
      const apiId = template.databaseId || template.id;
      await axios.delete(`/api/templates/${apiId}`);
      toast.success('Template deleted successfully!');
      fetchTemplates(); // Refresh the list
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const openCustomizeModal = (template) => {
    setSelectedTemplate(template);
    setCustomizedTemplate({
      ...template,
      title: template.title,
      description: template.description,
      questions: template.questions ? [...template.questions] : []
    });
    setShowCustomizeModal(true);
  };

  const handleCustomizeSave = async () => {
    try {
      // Use databaseId for API calls, fallback to id if databaseId doesn't exist
      const apiId = selectedTemplate.databaseId || selectedTemplate.id;
      const response = await axios.post(`/api/templates/${apiId}/customize`, customizedTemplate);
      toast.success('Customized template saved successfully!');
      setShowCustomizeModal(false);
      setSelectedTemplate(null);
      setCustomizedTemplate(null);
      // Navigate to the survey builder with the new survey
      navigate(`/builder/${response.data.surveyId}`);
    } catch (error) {
      console.error('Error saving customized template:', error);
      toast.error('Failed to save customized template');
    }
  };

  const handleSaveAsNewTemplate = async () => {
    try {
      const response = await axios.post('/api/templates', {
        title: `${customizedTemplate.title} (Customized)`,
        description: customizedTemplate.description,
        questions: customizedTemplate.questions
      });
      toast.success('Customized template saved as new template!');
      setShowCustomizeModal(false);
      setSelectedTemplate(null);
      setCustomizedTemplate(null);
      fetchTemplates(); // Refresh the list
    } catch (error) {
      console.error('Error saving as new template:', error);
      toast.error('Failed to save as new template');
    }
  };

  const updateCustomizedQuestion = (index, field, value) => {
    setCustomizedTemplate(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const addCustomizedQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: '',
      type: 'text',
      required: false,
      options: []
    };
    setCustomizedTemplate(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const removeCustomizedQuestion = (index) => {
    setCustomizedTemplate(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const getTemplateIcon = (templateId) => {
    const icons = {
      customer_satisfaction: <Users className="w-6 h-6" />,
      restaurant_feedback: <ShoppingCart className="w-6 h-6" />,
      hotel_experience: <Calendar className="w-6 h-6" />,
      ecommerce_feedback: <Globe className="w-6 h-6" />,
      customer_support: <Star className="w-6 h-6" />,
      employee_feedback: <Star className="w-6 h-6" />,
      product_feedback: <ShoppingCart className="w-6 h-6" />,
      event_feedback: <Calendar className="w-6 h-6" />,
      website_feedback: <Globe className="w-6 h-6" />,
      banking_feedback: <Sparkles className="w-6 h-6" />
    };
    return icons[templateId] || <Plus className="w-6 h-6" />;
  };

  const getTemplateColor = (templateId) => {
    const colors = {
      customer_satisfaction: 'bg-blue-500',
      restaurant_feedback: 'bg-orange-500',
      hotel_experience: 'bg-purple-500',
      ecommerce_feedback: 'bg-green-500',
      customer_support: 'bg-red-500',
      employee_feedback: 'bg-purple-500',
      product_feedback: 'bg-green-500',
      event_feedback: 'bg-orange-500',
      website_feedback: 'bg-indigo-500',
      banking_feedback: 'bg-emerald-500'
    };
    return colors[templateId] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
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
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Survey Templates</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose from our pre-built templates to get started quickly. 
            Each template is designed for specific use cases and can be customized to your needs.
          </p>
        </motion.div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Template Header */}
              <div className={`${getTemplateColor(template.id)} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getTemplateIcon(template.id)}
                    <h3 className="text-xl font-semibold ml-3">{template.title}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-90">
                      {template.questions ? template.questions.length : 0} Questions
                    </div>
                    <div className="text-xs opacity-75">
                      {template.questions ? Math.ceil(template.questions.length * 0.5) : 0} min
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-4">{template.description}</p>
                
                {/* Template Details */}
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Template ID:</span>
                    <span className="font-mono text-xs bg-white px-2 py-1 rounded">{template.id}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">Estimated Time:</span>
                    <span className="text-blue-600 font-medium">
                      {template.questions ? Math.ceil(template.questions.length * 0.5) : 0} min
                    </span>
                  </div>
                </div>
                
                {/* Survey Statistics */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Survey Overview:</h4>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-blue-600">{template.questions ? template.questions.length : 0}</div>
                      <div className="text-xs text-blue-500">Total Questions</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-green-600">
                        {template.questions ? template.questions.filter(q => q.required).length : 0}
                      </div>
                      <div className="text-xs text-green-500">Required</div>
                    </div>
                  </div>
                  
                  {/* Question Types Breakdown */}
                  <div className="mb-4">
                    <h5 className="text-xs font-semibold text-gray-600 mb-2">Question Types:</h5>
                    <div className="flex flex-wrap gap-2">
                      {template.questions && (() => {
                        const types = {};
                        template.questions.forEach(q => {
                          types[q.type] = (types[q.type] || 0) + 1;
                        });
                        return Object.entries(types).map(([type, count]) => (
                          <span key={type} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                            {type.replace('_', ' ')}: {count}
                          </span>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Response Options Summary */}
                  <div className="mb-4">
                    <h5 className="text-xs font-semibold text-gray-600 mb-2">Response Options:</h5>
                    <div className="space-y-2">
                      {template.questions && (() => {
                        const optionStats = {
                          emojiScales: 0,
                          totalOptions: 0,
                          textFields: 0,
                          multipleChoice: 0
                        };
                        
                        template.questions.forEach(q => {
                          if (q.type === 'emoji_scale') {
                            optionStats.emojiScales++;
                            optionStats.totalOptions += q.options ? q.options.length : 0;
                          } else if (q.type === 'text') {
                            optionStats.textFields++;
                          } else if (q.type === 'multiple_choice') {
                            optionStats.multipleChoice++;
                            optionStats.totalOptions += q.options ? q.options.length : 0;
                          }
                        });
                        
                        return (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {optionStats.emojiScales > 0 && (
                              <div className="bg-yellow-50 rounded p-2">
                                <div className="font-medium text-yellow-700">{optionStats.emojiScales}</div>
                                <div className="text-yellow-600">Emoji Scales</div>
                              </div>
                            )}
                            {optionStats.multipleChoice > 0 && (
                              <div className="bg-purple-50 rounded p-2">
                                <div className="font-medium text-purple-700">{optionStats.multipleChoice}</div>
                                <div className="text-purple-600">Multiple Choice</div>
                              </div>
                            )}
                            {optionStats.textFields > 0 && (
                              <div className="bg-green-50 rounded p-2">
                                <div className="font-medium text-green-700">{optionStats.textFields}</div>
                                <div className="text-green-600">Text Fields</div>
                              </div>
                            )}
                            {optionStats.totalOptions > 0 && (
                              <div className="bg-blue-50 rounded p-2">
                                <div className="font-medium text-blue-700">{optionStats.totalOptions}</div>
                                <div className="text-blue-600">Total Options</div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Questions Preview */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Questions Preview:</h4>
                  
                  {/* Debug Info */}
                  <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <div><strong>Debug Info:</strong></div>
                    <div>Template ID: {template.id}</div>
                    <div>Questions Array: {template.questions ? 'exists' : 'undefined'}</div>
                    <div>Questions Length: {template.questions ? template.questions.length : 'N/A'}</div>
                    {template.questions && template.questions.length > 0 && (
                      <div>First Question: {template.questions[0].text || template.questions[0].title || 'No text property'}</div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {template.questions && template.questions.slice(0, 3).map((question, qIndex) => (
                      <div key={qIndex} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-700 mb-1">
                              {question.text || question.title}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="px-2 py-1 bg-blue-100 rounded-full">
                                {question.type.replace('_', ' ')}
                              </span>
                              {question.required && (
                                <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full">
                                  Required
                                </span>
                              )}
                              {question.options && question.options.length > 0 && (
                                <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full">
                                  {question.options.length} options
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {template.questions && template.questions.length > 3 && (
                      <div className="text-center">
                        <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-2">
                          +{template.questions.length - 3} more questions
                        </div>
                      </div>
                    )}
                    {(!template.questions || template.questions.length === 0) && (
                      <div className="text-sm text-gray-400 italic bg-gray-50 rounded-lg p-3 text-center">
                        No questions preview available
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => createFromTemplate(template.databaseId || template.id, template)}
                    disabled={creating}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    {creating ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        Use This Template
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openCustomizeModal(template)}
                      className="btn-secondary text-sm py-2"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Customize
                    </button>
                    <button
                      onClick={() => duplicateTemplate(template.databaseId || template.id, template)}
                      className="btn-secondary text-sm py-2"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Duplicate
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate(`/templates/${template.databaseId || template.id}/edit`)}
                      className="btn-secondary text-sm py-2"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.databaseId || template.id, template)}
                      className="btn-danger text-sm py-2"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Create Custom Survey */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Don't see what you need?
            </h2>
            <p className="text-gray-600 mb-6">
              Create a custom survey from scratch with our powerful drag & drop builder.
            </p>
            <button
              onClick={() => navigate('/survey-builder')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center mx-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Custom Survey
            </button>
          </div>
        </motion.div>
      </div>

      {/* Customize Template Modal */}
      {showCustomizeModal && customizedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Customize Template: {selectedTemplate?.title}
                </h2>
                <button
                  onClick={() => setShowCustomizeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Template Details */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Template Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Title
                    </label>
                    <input
                      type="text"
                      value={customizedTemplate.title}
                      onChange={(e) => setCustomizedTemplate(prev => ({ ...prev, title: e.target.value }))}
                      className="input w-full"
                      placeholder="Enter template title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={customizedTemplate.description}
                      onChange={(e) => setCustomizedTemplate(prev => ({ ...prev, description: e.target.value }))}
                      className="input w-full"
                      rows={3}
                      placeholder="Enter template description"
                    />
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Questions</h3>
                  <button
                    onClick={addCustomizedQuestion}
                    className="btn-secondary text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Question
                  </button>
                </div>

                <div className="space-y-4">
                  {customizedTemplate.questions.map((question, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-sm font-medium text-gray-700">
                          Question {index + 1}
                        </span>
                        <button
                          onClick={() => removeCustomizedQuestion(index)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Question Text
                          </label>
                          <input
                            type="text"
                            value={question.text || question.title || ''}
                            onChange={(e) => updateCustomizedQuestion(index, 'text', e.target.value)}
                            className="input w-full"
                            placeholder="Enter your question"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Question Type
                            </label>
                            <select
                              value={question.type}
                              onChange={(e) => updateCustomizedQuestion(index, 'type', e.target.value)}
                              className="input"
                            >
                              <option value="text">Text</option>
                              <option value="multiple_choice">Multiple Choice</option>
                              <option value="emoji_scale">Emoji Scale</option>
                              <option value="scale">Scale (1-5)</option>
                              <option value="contact_followup">Comments & Phone</option>
                            </select>
                          </div>
                          <div className="flex items-center">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={question.required}
                                onChange={(e) => updateCustomizedQuestion(index, 'required', e.target.checked)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">Required</span>
                            </label>
                          </div>
                        </div>

                        {/* Options for multiple choice */}
                        {question.type === 'multiple_choice' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Options
                            </label>
                            <div className="space-y-2">
                              {(question.options || []).map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={typeof option === 'object' ? option.label || option.value : option}
                                    onChange={(e) => {
                                      const newOptions = [...(question.options || [])];
                                      newOptions[optionIndex] = e.target.value;
                                      updateCustomizedQuestion(index, 'options', newOptions);
                                    }}
                                    className="input flex-1"
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                  <button
                                    onClick={() => {
                                      const newOptions = (question.options || []).filter((_, j) => j !== optionIndex);
                                      updateCustomizedQuestion(index, 'options', newOptions);
                                    }}
                                    className="text-red-400 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const newOptions = [...(question.options || []), ''];
                                  updateCustomizedQuestion(index, 'options', newOptions);
                                }}
                                className="btn-secondary text-sm"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Option
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Options for emoji scale */}
                        {question.type === 'emoji_scale' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Emoji Scale Options
                            </label>
                            <div className="space-y-2">
                              {(question.options || []).map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={option.emoji || ''}
                                    onChange={(e) => {
                                      const newOptions = [...(question.options || [])];
                                      newOptions[optionIndex] = { ...newOptions[optionIndex], emoji: e.target.value };
                                      updateCustomizedQuestion(index, 'options', newOptions);
                                    }}
                                    className="input w-20"
                                    placeholder="😊"
                                  />
                                  <input
                                    type="number"
                                    value={option.value || ''}
                                    onChange={(e) => {
                                      const newOptions = [...(question.options || [])];
                                      newOptions[optionIndex] = { ...newOptions[optionIndex], value: parseInt(e.target.value) };
                                      updateCustomizedQuestion(index, 'options', newOptions);
                                    }}
                                    className="input w-20"
                                    placeholder="1"
                                  />
                                  <input
                                    type="text"
                                    value={option.label || ''}
                                    onChange={(e) => {
                                      const newOptions = [...(question.options || [])];
                                      newOptions[optionIndex] = { ...newOptions[optionIndex], label: e.target.value };
                                      updateCustomizedQuestion(index, 'options', newOptions);
                                    }}
                                    className="input flex-1"
                                    placeholder="Label"
                                  />
                                  <button
                                    onClick={() => {
                                      const newOptions = (question.options || []).filter((_, j) => j !== optionIndex);
                                      updateCustomizedQuestion(index, 'options', newOptions);
                                    }}
                                    className="text-red-400 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const newOptions = [...(question.options || []), { emoji: '', value: '', label: '' }];
                                  updateCustomizedQuestion(index, 'options', newOptions);
                                }}
                                className="btn-secondary text-sm"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Emoji Option
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Settings for contact followup */}
                        {question.type === 'contact_followup' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comments Placeholder
                              </label>
                              <input
                                type="text"
                                value={question.commentsPlaceholder || ''}
                                onChange={(e) => updateCustomizedQuestion(index, 'commentsPlaceholder', e.target.value)}
                                className="input w-full"
                                placeholder="We would love to hear from you, please provide your comments. (Optional)"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number Placeholder
                              </label>
                              <input
                                type="text"
                                value={question.phonePlaceholder || ''}
                                onChange={(e) => updateCustomizedQuestion(index, 'phonePlaceholder', e.target.value)}
                                className="input w-full"
                                placeholder="Phone number"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Country Code
                              </label>
                              <input
                                type="text"
                                value={question.countryCode || '+233'}
                                onChange={(e) => updateCustomizedQuestion(index, 'countryCode', e.target.value)}
                                className="input w-32"
                                placeholder="+233"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomizeSave}
                className="btn-primary"
              >
                Save Customizations
              </button>
              <button
                onClick={handleSaveAsNewTemplate}
                className="btn-primary"
              >
                Save as New Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyTemplates; 