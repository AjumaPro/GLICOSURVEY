import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class SurveyService {
  // Survey CRUD operations
  async getSurveys(params = {}) {
    try {
      const response = await api.get('/surveys', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch surveys');
    }
  }

  async getSurvey(id) {
    try {
      const response = await api.get(`/surveys/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch survey');
    }
  }

  async createSurvey(surveyData) {
    try {
      const response = await api.post('/surveys', surveyData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create survey');
    }
  }

  async updateSurvey(id, surveyData) {
    try {
      const response = await api.put(`/surveys/${id}`, surveyData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update survey');
    }
  }

  async saveSurvey(surveyData) {
    if (surveyData.id) {
      return this.updateSurvey(surveyData.id, surveyData);
    } else {
      return this.createSurvey(surveyData);
    }
  }

  async deleteSurvey(id) {
    try {
      const response = await api.delete(`/surveys/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete survey');
    }
  }

  async publishSurvey(id) {
    try {
      const response = await api.post(`/surveys/${id}/publish`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to publish survey');
    }
  }

  async unpublishSurvey(id) {
    try {
      const response = await api.post(`/surveys/${id}/unpublish`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unpublish survey');
    }
  }

  async duplicateSurvey(id) {
    try {
      const response = await api.post(`/surveys/${id}/duplicate`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to duplicate survey');
    }
  }

  // Question operations
  async addQuestion(surveyId, questionData) {
    try {
      const response = await api.post(`/surveys/${surveyId}/questions`, questionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add question');
    }
  }

  async updateQuestion(surveyId, questionId, questionData) {
    try {
      const response = await api.put(`/surveys/${surveyId}/questions/${questionId}`, questionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update question');
    }
  }

  async deleteQuestion(surveyId, questionId) {
    try {
      const response = await api.delete(`/surveys/${surveyId}/questions/${questionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete question');
    }
  }

  async reorderQuestions(surveyId, questionIds) {
    try {
      const response = await api.put(`/surveys/${surveyId}/questions/reorder`, { questionIds });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reorder questions');
    }
  }

  // Response operations
  async submitResponse(surveyId, responseData) {
    try {
      const response = await api.post(`/surveys/${surveyId}/responses`, responseData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit response');
    }
  }

  async getResponses(surveyId, params = {}) {
    try {
      const response = await api.get(`/surveys/${surveyId}/responses`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch responses');
    }
  }

  async getResponse(surveyId, responseId) {
    try {
      const response = await api.get(`/surveys/${surveyId}/responses/${responseId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch response');
    }
  }

  async deleteResponse(surveyId, responseId) {
    try {
      const response = await api.delete(`/surveys/${surveyId}/responses/${responseId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete response');
    }
  }

  // Analytics operations
  async getAnalytics(surveyId, params = {}) {
    try {
      const response = await api.get(`/surveys/${surveyId}/analytics`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }

  async getResponseStats(surveyId) {
    try {
      const response = await api.get(`/surveys/${surveyId}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch response stats');
    }
  }

  async getCompletionRate(surveyId) {
    try {
      const response = await api.get(`/surveys/${surveyId}/completion-rate`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch completion rate');
    }
  }

  async getResponseTimeline(surveyId, params = {}) {
    try {
      const response = await api.get(`/surveys/${surveyId}/timeline`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch response timeline');
    }
  }

  async getDeviceStats(surveyId) {
    try {
      const response = await api.get(`/surveys/${surveyId}/device-stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch device stats');
    }
  }

  async getLocationStats(surveyId) {
    try {
      const response = await api.get(`/surveys/${surveyId}/location-stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch location stats');
    }
  }

  // Export operations
  async exportResponses(surveyId, format = 'csv', params = {}) {
    try {
      const response = await api.get(`/surveys/${surveyId}/export`, {
        params: { format, ...params },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export responses');
    }
  }

  async exportAnalytics(surveyId, format = 'pdf', params = {}) {
    try {
      const response = await api.get(`/surveys/${surveyId}/export-analytics`, {
        params: { format, ...params },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export analytics');
    }
  }

  // Template operations
  async getTemplates(params = {}) {
    try {
      const response = await api.get('/templates', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch templates');
    }
  }

  async getTemplate(id) {
    try {
      const response = await api.get(`/templates/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch template');
    }
  }

  async createTemplate(templateData) {
    try {
      const response = await api.post('/templates', templateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create template');
    }
  }

  async updateTemplate(id, templateData) {
    try {
      const response = await api.put(`/templates/${id}`, templateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update template');
    }
  }

  async deleteTemplate(id) {
    try {
      const response = await api.delete(`/templates/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete template');
    }
  }

  async saveAsTemplate(surveyId, templateData) {
    try {
      const response = await api.post(`/surveys/${surveyId}/save-as-template`, templateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to save as template');
    }
  }

  // Sharing operations
  async getShareSettings(surveyId) {
    try {
      const response = await api.get(`/surveys/${surveyId}/share`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch share settings');
    }
  }

  async updateShareSettings(surveyId, settings) {
    try {
      const response = await api.put(`/surveys/${surveyId}/share`, settings);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update share settings');
    }
  }

  async generateShareLink(surveyId, settings = {}) {
    try {
      const response = await api.post(`/surveys/${surveyId}/share-link`, settings);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate share link');
    }
  }

  async generateQRCode(surveyId, settings = {}) {
    try {
      const response = await api.post(`/surveys/${surveyId}/qr-code`, settings);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate QR code');
    }
  }

  // Validation operations
  async validateSurvey(surveyData) {
    try {
      const response = await api.post('/surveys/validate', surveyData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to validate survey');
    }
  }

  async validateQuestion(questionData) {
    try {
      const response = await api.post('/questions/validate', questionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to validate question');
    }
  }

  // Utility operations
  async getQuestionTypes() {
    try {
      const response = await api.get('/question-types');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch question types');
    }
  }

  async getEmojiScales() {
    try {
      const response = await api.get('/emoji-scales');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch emoji scales');
    }
  }

  async getSurveyThemes() {
    try {
      const response = await api.get('/survey-themes');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch survey themes');
    }
  }

  // Search operations
  async searchSurveys(query, params = {}) {
    try {
      const response = await api.get('/surveys/search', {
        params: { q: query, ...params }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search surveys');
    }
  }

  async searchTemplates(query, params = {}) {
    try {
      const response = await api.get('/templates/search', {
        params: { q: query, ...params }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search templates');
    }
  }

  // Batch operations
  async bulkDeleteSurveys(surveyIds) {
    try {
      const response = await api.post('/surveys/bulk-delete', { surveyIds });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to bulk delete surveys');
    }
  }

  async bulkPublishSurveys(surveyIds) {
    try {
      const response = await api.post('/surveys/bulk-publish', { surveyIds });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to bulk publish surveys');
    }
  }

  async bulkUnpublishSurveys(surveyIds) {
    try {
      const response = await api.post('/surveys/bulk-unpublish', { surveyIds });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to bulk unpublish surveys');
    }
  }

  // File upload operations
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload image');
    }
  }

  async uploadQuestions(surveyId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(`/surveys/${surveyId}/upload-questions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload questions');
    }
  }
}

// Create and export singleton instance
const surveyService = new SurveyService();
export { surveyService };
export default surveyService;

