import React, { useState, useEffect } from 'react';
import { useSurveyBuilder } from '../../contexts/SurveyBuilderContext';
import { 
  getQuestionTypeConfig, 
  validateQuestionSettings, 
  QUESTION_TYPES,
  QUESTION_CATEGORIES 
} from '../../services/questionTypesService';

const QuestionEditor = ({ questionId, onSave, onCancel }) => {
  const { state, actions } = useSurveyBuilder();
  const [question, setQuestion] = useState(null);
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (questionId) {
      const foundQuestion = state.survey.questions.find(q => q.id === questionId);
      if (foundQuestion) {
        setQuestion({ ...foundQuestion });
      }
    } else {
      // Create new question
      setQuestion({
        id: null,
        type: state.ui.selectedQuestionType || QUESTION_TYPES.TEXT,
        title: '',
        description: '',
        required: false,
        options: [],
        settings: {},
        order: state.survey.questions.length
      });
    }
  }, [questionId, state.ui.selectedQuestionType, state.survey.questions.length]);

  useEffect(() => {
    if (question) {
      validateQuestion();
    }
  }, [question]);

  const validateQuestion = () => {
    const newErrors = {};
    
    // Validate title
    if (!question.title.trim()) {
      newErrors.title = 'Question title is required';
    }
    
    // Validate question type specific settings
    const typeConfig = getQuestionTypeConfig(question.type);
    if (typeConfig) {
      const validation = validateQuestionSettings(question.type, question.settings);
      if (!validation.valid) {
        newErrors.settings = validation.errors;
      }
      
      // Validate options for choice questions
      if (typeConfig.hasOptions) {
        if (!question.options || question.options.length < 2) {
          newErrors.options = 'At least 2 options are required';
        }
        
        // Check for empty options
        const emptyOptions = question.options.filter(opt => !opt.trim());
        if (emptyOptions.length > 0) {
          newErrors.options = 'All options must have text';
        }
      }
    }
    
    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  };

  const handleInputChange = (field, value) => {
    setQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSettingsChange = (key, value) => {
    setQuestion(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  };

  const handleOptionChange = (index, value) => {
    setQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const addOption = () => {
    setQuestion(prev => ({
      ...prev,
      options: [...prev.options, `Option ${prev.options.length + 1}`]
    }));
  };

  const removeOption = (index) => {
    setQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const moveOption = (index, direction) => {
    const newOptions = [...question.options];
    const newIndex = index + direction;
    
    if (newIndex >= 0 && newIndex < newOptions.length) {
      [newOptions[index], newOptions[newIndex]] = [newOptions[newIndex], newOptions[index]];
      setQuestion(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };

  const handleSave = () => {
    if (!isValid) return;
    
    if (questionId) {
      actions.updateQuestion(questionId, question);
    } else {
      actions.addQuestion(question);
    }
    
    onSave && onSave(question);
  };

  const handleCancel = () => {
    onCancel && onCancel();
  };

  if (!question) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  const typeConfig = getQuestionTypeConfig(question.type);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {questionId ? 'Edit Question' : 'Add New Question'}
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {questionId ? 'Update Question' : 'Add Question'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Type
          </label>
          <select
            value={question.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(QUESTION_TYPES).map(([key, value]) => (
              <option key={key} value={value}>
                {getQuestionTypeConfig(value)?.name} - {getQuestionTypeConfig(value)?.description}
              </option>
            ))}
          </select>
        </div>

        {/* Question Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Title *
          </label>
          <input
            type="text"
            value={question.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter your question..."
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Question Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={question.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Add additional context or instructions..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Required Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="required"
            checked={question.required}
            onChange={(e) => handleInputChange('required', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="required" className="ml-2 block text-sm text-gray-700">
            This question is required
          </label>
        </div>

        {/* Question Type Specific Settings */}
        {typeConfig && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {typeConfig.name} Settings
            </h3>
            
            {/* Options for choice questions */}
            {typeConfig.hasOptions && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options *
                </label>
                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.options ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <button
                        onClick={() => moveOption(index, -1)}
                        disabled={index === 0}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveOption(index, 1)}
                        disabled={index === question.options.length - 1}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeOption(index)}
                        className="p-2 text-red-400 hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addOption}
                    className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    + Add Option
                  </button>
                </div>
                {errors.options && (
                  <p className="mt-1 text-sm text-red-600">{errors.options}</p>
                )}
              </div>
            )}

            {/* Type-specific settings */}
            {renderTypeSpecificSettings(question.type, question.settings, handleSettingsChange)}
          </div>
        )}

        {/* Validation Errors */}
        {errors.settings && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">Settings Validation Errors:</h4>
            <ul className="text-sm text-red-700 list-disc list-inside">
              {errors.settings.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to render type-specific settings
const renderTypeSpecificSettings = (type, settings, onChange) => {
  switch (type) {
    case QUESTION_TYPES.TEXT:
    case QUESTION_TYPES.TEXTAREA:
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placeholder Text
            </label>
            <input
              type="text"
              value={settings.placeholder || ''}
              onChange={(e) => onChange('placeholder', e.target.value)}
              placeholder="Enter placeholder text..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Length
            </label>
            <input
              type="number"
              value={settings.maxLength || ''}
              onChange={(e) => onChange('maxLength', parseInt(e.target.value) || null)}
              placeholder="Maximum characters..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      );

    case QUESTION_TYPES.NUMBER:
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Value
              </label>
              <input
                type="number"
                value={settings.min || ''}
                onChange={(e) => onChange('min', parseFloat(e.target.value) || null)}
                placeholder="Min value..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Value
              </label>
              <input
                type="number"
                value={settings.max || ''}
                onChange={(e) => onChange('max', parseFloat(e.target.value) || null)}
                placeholder="Max value..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step Value
            </label>
            <input
              type="number"
              value={settings.step || 1}
              onChange={(e) => onChange('step', parseFloat(e.target.value) || 1)}
              placeholder="Step value..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      );

    case QUESTION_TYPES.RATING:
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Rating
            </label>
            <input
              type="number"
              value={settings.maxRating || 5}
              onChange={(e) => onChange('maxRating', parseInt(e.target.value) || 5)}
              min="2"
              max="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowHalfStars"
              checked={settings.allowHalfStars || false}
              onChange={(e) => onChange('allowHalfStars', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="allowHalfStars" className="ml-2 block text-sm text-gray-700">
              Allow half stars
            </label>
          </div>
        </div>
      );

    case QUESTION_TYPES.SLIDER:
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Value
              </label>
              <input
                type="number"
                value={settings.min || 0}
                onChange={(e) => onChange('min', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Value
              </label>
              <input
                type="number"
                value={settings.max || 100}
                onChange={(e) => onChange('max', parseFloat(e.target.value) || 100)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step Value
            </label>
            <input
              type="number"
              value={settings.step || 1}
              onChange={(e) => onChange('step', parseFloat(e.target.value) || 1)}
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default QuestionEditor;

