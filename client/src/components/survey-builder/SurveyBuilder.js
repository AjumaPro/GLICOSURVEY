import React, { useState, useEffect } from 'react';
import { useSurveyBuilder } from '../../contexts/SurveyBuilderContext';
import { useParams, useNavigate } from 'react-router-dom';
import QuestionList from './QuestionList';
import QuestionEditor from './QuestionEditor';
import QuestionTypeSelector from './QuestionTypeSelector';
import SurveySettings from './SurveySettings';
import SurveyPreview from './SurveyPreview';
import {
  CogIcon,
  EyeIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const SurveyBuilder = () => {
  const { state, actions } = useSurveyBuilder();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [showQuestionTypeSelector, setShowQuestionTypeSelector] = useState(false);
  const [showSurveySettings, setShowSurveySettings] = useState(false);
  const [showSurveyPreview, setShowSurveyPreview] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  const handleSave = async () => {
    try {
      await actions.saveSurvey(state.survey);
    } catch (error) {
      console.error('Failed to save survey:', error);
    }
  };

  useEffect(() => {
    if (id) {
      actions.loadSurvey(id);
    } else {
      actions.resetSurvey();
    }
  }, [id, actions]);

  useEffect(() => {
    // Auto-save functionality
    if (state.survey.id && state.survey.settings.autoSave) {
      const timeoutId = setTimeout(() => {
        if (!state.ui.saving && state.survey.questions.length > 0) {
          handleSave();
        }
      }, 5000);

      return () => clearTimeout(timeoutId);
    }
  }, [state.survey, state.ui.saving, handleSave]);

  const handleAddQuestion = () => {
    setShowQuestionTypeSelector(true);
  };

  const handleSelectQuestionType = (type) => {
    setShowQuestionTypeSelector(false);
    setShowQuestionEditor(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestionId(question.id);
    setShowQuestionEditor(true);
  };

  const handleSaveQuestion = (question) => {
    setShowQuestionEditor(false);
    setEditingQuestionId(null);
  };

  const handleCancelQuestion = () => {
    setShowQuestionEditor(false);
    setEditingQuestionId(null);
  };

  const handlePublish = async () => {
    if (!state.survey.id) {
      await handleSave();
    }
    
    try {
      await actions.publishSurvey(state.survey.id);
      navigate('/surveys/published');
    } catch (error) {
      console.error('Failed to publish survey:', error);
    }
  };

  const handleBack = () => {
    navigate('/surveys');
  };

  const getSurveyStatus = () => {
    if (!state.survey.id) return 'draft';
    return state.survey.status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {state.survey.title || 'Untitled Survey'}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getSurveyStatus())}`}>
                    {getSurveyStatus()}
                  </span>
                  {state.survey.questions.length > 0 && (
                    <span className="text-sm text-gray-500">
                      {state.survey.questions.length} question{state.survey.questions.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSurveySettings(true)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <CogIcon className="w-4 h-4" />
                <span>Settings</span>
              </button>
              
              <button
                onClick={() => setShowSurveyPreview(true)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <EyeIcon className="w-4 h-4" />
                <span>Preview</span>
              </button>
              
              <button
                onClick={handleSave}
                disabled={state.ui.saving}
                className="flex items-center space-x-2 px-3 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                <span>{state.ui.saving ? 'Saving...' : 'Save'}</span>
              </button>
              
              {getSurveyStatus() === 'draft' && (
                <button
                  onClick={handlePublish}
                  className="flex items-center space-x-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ShareIcon className="w-4 h-4" />
                  <span>Publish</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Survey Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Survey Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Survey Title
                  </label>
                  <input
                    type="text"
                    value={state.survey.title}
                    onChange={(e) => actions.updateSurvey({ title: e.target.value })}
                    placeholder="Enter survey title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={state.survey.description}
                    onChange={(e) => actions.updateSurvey({ description: e.target.value })}
                    placeholder="Enter survey description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Questions</span>
                  <span className="font-medium text-gray-900">{state.survey.questions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getSurveyStatus())}`}>
                    {getSurveyStatus()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm text-gray-900">
                    {state.survey.updated_at ? new Date(state.survey.updated_at).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleAddQuestion}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
                <button
                  onClick={() => setShowSurveySettings(true)}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <CogIcon className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => setShowSurveyPreview(true)}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <EyeIcon className="w-4 h-4" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          </div>

          {/* Questions Area */}
          <div className="lg:col-span-2">
            <QuestionList
              onEditQuestion={handleEditQuestion}
              onAddQuestion={handleAddQuestion}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showQuestionTypeSelector && (
        <QuestionTypeSelector
          onSelectType={handleSelectQuestionType}
          onClose={() => setShowQuestionTypeSelector(false)}
        />
      )}

      {showQuestionEditor && (
        <QuestionEditor
          questionId={editingQuestionId}
          onSave={handleSaveQuestion}
          onCancel={handleCancelQuestion}
        />
      )}

      {showSurveySettings && (
        <SurveySettings
          onClose={() => setShowSurveySettings(false)}
        />
      )}

      {showSurveyPreview && (
        <SurveyPreview
          onClose={() => setShowSurveyPreview(false)}
        />
      )}

      {/* Success/Error Messages */}
      {state.ui.success && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50">
          {state.ui.success}
        </div>
      )}

      {state.ui.error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
          {state.ui.error}
        </div>
      )}

      {/* Loading Overlay */}
      {state.ui.loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="spinner w-6 h-6"></div>
            <span className="text-gray-700">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyBuilder;

