import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { surveyService } from '../services/surveyService';

const SurveyBuilderContext = createContext();

// Initial state
const initialState = {
  // Survey data
  survey: {
    id: null,
    title: '',
    description: '',
    status: 'draft',
    settings: {
      allowAnonymous: true,
      requireLogin: false,
      showProgress: true,
      allowBack: true,
      autoSave: true,
      maxResponses: 0,
      responseTimeout: 3600,
      theme: 'default',
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      }
    },
    questions: [],
    created_at: null,
    updated_at: null,
    created_by: null
  },
  
  // UI state
  ui: {
    loading: false,
    saving: false,
    error: null,
    success: null,
    currentQuestionId: null,
    selectedQuestionType: 'text',
    showPreview: false,
    showSettings: false,
    showTemplates: false,
    showAnalytics: false,
    sidebarCollapsed: false,
    activeTab: 'questions'
  },
  
  // Question editing state
  editing: {
    isEditing: false,
    editingQuestionId: null,
    editingQuestionType: null,
    editingQuestionData: null
  },
  
  // Templates
  templates: [],
  selectedTemplate: null,
  
  // Analytics
  analytics: {
    totalResponses: 0,
    completionRate: 0,
    averageTime: 0,
    responsesByDay: [],
    responsesByQuestion: [],
    deviceStats: {},
    locationStats: {}
  },
  
  // Validation
  validation: {
    errors: {},
    warnings: {}
  }
};

// Action types
const ActionTypes = {
  // Survey actions
  SET_SURVEY: 'SET_SURVEY',
  UPDATE_SURVEY: 'UPDATE_SURVEY',
  RESET_SURVEY: 'RESET_SURVEY',
  
  // Question actions
  ADD_QUESTION: 'ADD_QUESTION',
  UPDATE_QUESTION: 'UPDATE_QUESTION',
  DELETE_QUESTION: 'DELETE_QUESTION',
  DUPLICATE_QUESTION: 'DUPLICATE_QUESTION',
  REORDER_QUESTIONS: 'REORDER_QUESTIONS',
  SET_CURRENT_QUESTION: 'SET_CURRENT_QUESTION',
  
  // UI actions
  SET_LOADING: 'SET_LOADING',
  SET_SAVING: 'SET_SAVING',
  SET_ERROR: 'SET_ERROR',
  SET_SUCCESS: 'SET_SUCCESS',
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  TOGGLE_PREVIEW: 'TOGGLE_PREVIEW',
  TOGGLE_SETTINGS: 'TOGGLE_SETTINGS',
  TOGGLE_TEMPLATES: 'TOGGLE_TEMPLATES',
  TOGGLE_ANALYTICS: 'TOGGLE_ANALYTICS',
  SET_SELECTED_QUESTION_TYPE: 'SET_SELECTED_QUESTION_TYPE',
  
  // Editing actions
  START_EDITING: 'START_EDITING',
  STOP_EDITING: 'STOP_EDITING',
  UPDATE_EDITING_QUESTION: 'UPDATE_EDITING_QUESTION',
  
  // Template actions
  SET_TEMPLATES: 'SET_TEMPLATES',
  SET_SELECTED_TEMPLATE: 'SET_SELECTED_TEMPLATE',
  APPLY_TEMPLATE: 'APPLY_TEMPLATE',
  
  // Analytics actions
  SET_ANALYTICS: 'SET_ANALYTICS',
  UPDATE_ANALYTICS: 'UPDATE_ANALYTICS',
  
  // Validation actions
  SET_VALIDATION_ERRORS: 'SET_VALIDATION_ERRORS',
  CLEAR_VALIDATION_ERRORS: 'CLEAR_VALIDATION_ERRORS',
  SET_VALIDATION_WARNINGS: 'SET_VALIDATION_WARNINGS',
  CLEAR_VALIDATION_WARNINGS: 'CLEAR_VALIDATION_WARNINGS'
};

// Reducer
function surveyBuilderReducer(state, action) {
  switch (action.type) {
    // Survey actions
    case ActionTypes.SET_SURVEY:
      return {
        ...state,
        survey: { ...initialState.survey, ...action.payload },
        ui: { ...state.ui, loading: false, error: null }
      };
      
    case ActionTypes.UPDATE_SURVEY:
      return {
        ...state,
        survey: { ...state.survey, ...action.payload },
        ui: { ...state.ui, saving: false, error: null }
      };
      
    case ActionTypes.RESET_SURVEY:
      return {
        ...state,
        survey: { ...initialState.survey },
        ui: { ...state.ui, error: null, success: null }
      };
      
    // Question actions
    case ActionTypes.ADD_QUESTION:
      const newQuestion = {
        id: Date.now().toString(),
        type: action.payload.type,
        title: action.payload.title || '',
        description: '',
        required: false,
        options: action.payload.options || [],
        settings: action.payload.settings || {},
        order: state.survey.questions.length,
        created_at: new Date().toISOString()
      };
      
      return {
        ...state,
        survey: {
          ...state.survey,
          questions: [...state.survey.questions, newQuestion]
        },
        ui: {
          ...state.ui,
          currentQuestionId: newQuestion.id
        }
      };
      
    case ActionTypes.UPDATE_QUESTION:
      return {
        ...state,
        survey: {
          ...state.survey,
          questions: state.survey.questions.map(q =>
            q.id === action.payload.id ? { ...q, ...action.payload.updates } : q
          )
        }
      };
      
    case ActionTypes.DELETE_QUESTION:
      return {
        ...state,
        survey: {
          ...state.survey,
          questions: state.survey.questions.filter(q => q.id !== action.payload.id)
        },
        ui: {
          ...state.ui,
          currentQuestionId: state.ui.currentQuestionId === action.payload.id ? null : state.ui.currentQuestionId
        }
      };
      
    case ActionTypes.DUPLICATE_QUESTION:
      const questionToDuplicate = state.survey.questions.find(q => q.id === action.payload.id);
      if (!questionToDuplicate) return state;
      
      const duplicatedQuestion = {
        ...questionToDuplicate,
        id: Date.now().toString(),
        title: `${questionToDuplicate.title} (Copy)`,
        order: state.survey.questions.length,
        created_at: new Date().toISOString()
      };
      
      return {
        ...state,
        survey: {
          ...state.survey,
          questions: [...state.survey.questions, duplicatedQuestion]
        }
      };
      
    case ActionTypes.REORDER_QUESTIONS:
      return {
        ...state,
        survey: {
          ...state.survey,
          questions: action.payload.questions
        }
      };
      
    case ActionTypes.SET_CURRENT_QUESTION:
      return {
        ...state,
        ui: {
          ...state.ui,
          currentQuestionId: action.payload.id
        }
      };
      
    // UI actions
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        ui: { ...state.ui, loading: action.payload }
      };
      
    case ActionTypes.SET_SAVING:
      return {
        ...state,
        ui: { ...state.ui, saving: action.payload }
      };
      
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        ui: { ...state.ui, error: action.payload, loading: false, saving: false }
      };
      
    case ActionTypes.SET_SUCCESS:
      return {
        ...state,
        ui: { ...state.ui, success: action.payload }
      };
      
    case ActionTypes.SET_ACTIVE_TAB:
      return {
        ...state,
        ui: { ...state.ui, activeTab: action.payload }
      };
      
    case ActionTypes.TOGGLE_SIDEBAR:
      return {
        ...state,
        ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed }
      };
      
    case ActionTypes.TOGGLE_PREVIEW:
      return {
        ...state,
        ui: { ...state.ui, showPreview: !state.ui.showPreview }
      };
      
    case ActionTypes.TOGGLE_SETTINGS:
      return {
        ...state,
        ui: { ...state.ui, showSettings: !state.ui.showSettings }
      };
      
    case ActionTypes.TOGGLE_TEMPLATES:
      return {
        ...state,
        ui: { ...state.ui, showTemplates: !state.ui.showTemplates }
      };
      
    case ActionTypes.TOGGLE_ANALYTICS:
      return {
        ...state,
        ui: { ...state.ui, showAnalytics: !state.ui.showAnalytics }
      };
      
    case ActionTypes.SET_SELECTED_QUESTION_TYPE:
      return {
        ...state,
        ui: { ...state.ui, selectedQuestionType: action.payload }
      };
      
    // Editing actions
    case ActionTypes.START_EDITING:
      return {
        ...state,
        editing: {
          isEditing: true,
          editingQuestionId: action.payload.id,
          editingQuestionType: action.payload.type,
          editingQuestionData: action.payload.data
        }
      };
      
    case ActionTypes.STOP_EDITING:
      return {
        ...state,
        editing: {
          isEditing: false,
          editingQuestionId: null,
          editingQuestionType: null,
          editingQuestionData: null
        }
      };
      
    case ActionTypes.UPDATE_EDITING_QUESTION:
      return {
        ...state,
        editing: {
          ...state.editing,
          editingQuestionData: { ...state.editing.editingQuestionData, ...action.payload }
        }
      };
      
    // Template actions
    case ActionTypes.SET_TEMPLATES:
      return {
        ...state,
        templates: action.payload
      };
      
    case ActionTypes.SET_SELECTED_TEMPLATE:
      return {
        ...state,
        selectedTemplate: action.payload
      };
      
    case ActionTypes.APPLY_TEMPLATE:
      return {
        ...state,
        survey: {
          ...state.survey,
          questions: action.payload.questions,
          settings: { ...state.survey.settings, ...action.payload.settings }
        }
      };
      
    // Analytics actions
    case ActionTypes.SET_ANALYTICS:
      return {
        ...state,
        analytics: { ...state.analytics, ...action.payload }
      };
      
    case ActionTypes.UPDATE_ANALYTICS:
      return {
        ...state,
        analytics: { ...state.analytics, ...action.payload }
      };
      
    // Validation actions
    case ActionTypes.SET_VALIDATION_ERRORS:
      return {
        ...state,
        validation: { ...state.validation, errors: action.payload }
      };
      
    case ActionTypes.CLEAR_VALIDATION_ERRORS:
      return {
        ...state,
        validation: { ...state.validation, errors: {} }
      };
      
    case ActionTypes.SET_VALIDATION_WARNINGS:
      return {
        ...state,
        validation: { ...state.validation, warnings: action.payload }
      };
      
    case ActionTypes.CLEAR_VALIDATION_WARNINGS:
      return {
        ...state,
        validation: { ...state.validation, warnings: {} }
      };
      
    default:
      return state;
  }
}

// Provider component
export function SurveyBuilderProvider({ children }) {
  const [state, dispatch] = useReducer(surveyBuilderReducer, initialState);
  
  // Actions
  const actions = {
    // Survey actions
    setSurvey: (survey) => dispatch({ type: ActionTypes.SET_SURVEY, payload: survey }),
    updateSurvey: (updates) => dispatch({ type: ActionTypes.UPDATE_SURVEY, payload: updates }),
    resetSurvey: () => dispatch({ type: ActionTypes.RESET_SURVEY }),
    
    // Question actions
    addQuestion: (question) => dispatch({ type: ActionTypes.ADD_QUESTION, payload: question }),
    updateQuestion: (id, updates) => dispatch({ type: ActionTypes.UPDATE_QUESTION, payload: { id, updates } }),
    deleteQuestion: (id) => dispatch({ type: ActionTypes.DELETE_QUESTION, payload: { id } }),
    duplicateQuestion: (id) => dispatch({ type: ActionTypes.DUPLICATE_QUESTION, payload: { id } }),
    reorderQuestions: (questions) => dispatch({ type: ActionTypes.REORDER_QUESTIONS, payload: { questions } }),
    setCurrentQuestion: (id) => dispatch({ type: ActionTypes.SET_CURRENT_QUESTION, payload: { id } }),
    
    // UI actions
    setLoading: (loading) => dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
    setSaving: (saving) => dispatch({ type: ActionTypes.SET_SAVING, payload: saving }),
    setError: (error) => dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    setSuccess: (success) => dispatch({ type: ActionTypes.SET_SUCCESS, payload: success }),
    setActiveTab: (tab) => dispatch({ type: ActionTypes.SET_ACTIVE_TAB, payload: tab }),
    toggleSidebar: () => dispatch({ type: ActionTypes.TOGGLE_SIDEBAR }),
    togglePreview: () => dispatch({ type: ActionTypes.TOGGLE_PREVIEW }),
    toggleSettings: () => dispatch({ type: ActionTypes.TOGGLE_SETTINGS }),
    toggleTemplates: () => dispatch({ type: ActionTypes.TOGGLE_TEMPLATES }),
    toggleAnalytics: () => dispatch({ type: ActionTypes.TOGGLE_ANALYTICS }),
    setSelectedQuestionType: (type) => dispatch({ type: ActionTypes.SET_SELECTED_QUESTION_TYPE, payload: type }),
    
    // Editing actions
    startEditing: (id, type, data) => dispatch({ type: ActionTypes.START_EDITING, payload: { id, type, data } }),
    stopEditing: () => dispatch({ type: ActionTypes.STOP_EDITING }),
    updateEditingQuestion: (updates) => dispatch({ type: ActionTypes.UPDATE_EDITING_QUESTION, payload: updates }),
    
    // Template actions
    setTemplates: (templates) => dispatch({ type: ActionTypes.SET_TEMPLATES, payload: templates }),
    setSelectedTemplate: (template) => dispatch({ type: ActionTypes.SET_SELECTED_TEMPLATE, payload: template }),
    applyTemplate: (template) => dispatch({ type: ActionTypes.APPLY_TEMPLATE, payload: template }),
    
    // Analytics actions
    setAnalytics: (analytics) => dispatch({ type: ActionTypes.SET_ANALYTICS, payload: analytics }),
    updateAnalytics: (analytics) => dispatch({ type: ActionTypes.UPDATE_ANALYTICS, payload: analytics }),
    
    // Validation actions
    setValidationErrors: (errors) => dispatch({ type: ActionTypes.SET_VALIDATION_ERRORS, payload: errors }),
    clearValidationErrors: () => dispatch({ type: ActionTypes.CLEAR_VALIDATION_ERRORS }),
    setValidationWarnings: (warnings) => dispatch({ type: ActionTypes.SET_VALIDATION_WARNINGS, payload: warnings }),
    clearValidationWarnings: () => dispatch({ type: ActionTypes.CLEAR_VALIDATION_WARNINGS }),
    
    // Async actions
    loadSurvey: async (id) => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        const survey = await surveyService.getSurvey(id);
        dispatch({ type: ActionTypes.SET_SURVEY, payload: survey });
        return survey;
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },
    
    saveSurvey: async (surveyData) => {
      try {
        dispatch({ type: ActionTypes.SET_SAVING, payload: true });
        const savedSurvey = await surveyService.saveSurvey(surveyData);
        dispatch({ type: ActionTypes.UPDATE_SURVEY, payload: savedSurvey });
        dispatch({ type: ActionTypes.SET_SUCCESS, payload: 'Survey saved successfully!' });
        return savedSurvey;
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },
    
    publishSurvey: async (id) => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        const publishedSurvey = await surveyService.publishSurvey(id);
        dispatch({ type: ActionTypes.UPDATE_SURVEY, payload: publishedSurvey });
        dispatch({ type: ActionTypes.SET_SUCCESS, payload: 'Survey published successfully!' });
        return publishedSurvey;
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },
    
    loadTemplates: async () => {
      try {
        const templates = await surveyService.getTemplates();
        dispatch({ type: ActionTypes.SET_TEMPLATES, payload: templates });
        return templates;
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },
    
    loadAnalytics: async (id) => {
      try {
        const analytics = await surveyService.getAnalytics(id);
        dispatch({ type: ActionTypes.SET_ANALYTICS, payload: analytics });
        return analytics;
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    }
  };
  
  // Auto-save functionality
  useEffect(() => {
    if (state.survey.id && state.survey.settings.autoSave) {
      const timeoutId = setTimeout(() => {
        if (!state.ui.saving && state.survey.questions.length > 0) {
          actions.saveSurvey(state.survey);
        }
      }, 5000); // Auto-save after 5 seconds of inactivity
      
      return () => clearTimeout(timeoutId);
    }
  }, [state.survey, state.ui.saving]);
  
  // Clear success messages after 3 seconds
  useEffect(() => {
    if (state.ui.success) {
      const timeoutId = setTimeout(() => {
        dispatch({ type: ActionTypes.SET_SUCCESS, payload: null });
      }, 3000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [state.ui.success]);
  
  const value = {
    state,
    actions
  };
  
  return (
    <SurveyBuilderContext.Provider value={value}>
      {children}
    </SurveyBuilderContext.Provider>
  );
}

// Hook to use the context
export function useSurveyBuilder() {
  const context = useContext(SurveyBuilderContext);
  if (!context) {
    throw new Error('useSurveyBuilder must be used within a SurveyBuilderProvider');
  }
  return context;
}

export default SurveyBuilderContext;

