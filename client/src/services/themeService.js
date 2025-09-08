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

class ThemeService {
  // Theme CRUD operations
  async getThemes(params = {}) {
    try {
      const response = await api.get('/themes', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch themes');
    }
  }

  async getTheme(id) {
    try {
      const response = await api.get(`/themes/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch theme');
    }
  }

  async createTheme(themeData) {
    try {
      const response = await api.post('/themes', themeData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create theme');
    }
  }

  async updateTheme(id, themeData) {
    try {
      const response = await api.put(`/themes/${id}`, themeData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update theme');
    }
  }

  async deleteTheme(id) {
    try {
      const response = await api.delete(`/themes/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete theme');
    }
  }

  async duplicateTheme(id) {
    try {
      const response = await api.post(`/themes/${id}/duplicate`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to duplicate theme');
    }
  }

  // Theme preview and export
  async getThemePreview(id) {
    try {
      const response = await api.get(`/themes/${id}/preview`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get theme preview');
    }
  }

  async exportTheme(id, format = 'json') {
    try {
      const response = await api.get(`/themes/${id}/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export theme');
    }
  }

  async importTheme(file) {
    try {
      const formData = new FormData();
      formData.append('theme', file);
      
      const response = await api.post('/themes/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to import theme');
    }
  }

  // Theme categories and templates
  async getThemeCategories() {
    try {
      const response = await api.get('/themes/categories');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch theme categories');
    }
  }

  async getThemeTemplates(category = null) {
    try {
      const params = category ? { category } : {};
      const response = await api.get('/themes/templates', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch theme templates');
    }
  }

  async createThemeFromTemplate(templateId, customizations = {}) {
    try {
      const response = await api.post(`/themes/templates/${templateId}/create`, customizations);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create theme from template');
    }
  }

  // Theme usage and analytics
  async getThemeUsage(id) {
    try {
      const response = await api.get(`/themes/${id}/usage`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch theme usage');
    }
  }

  async getThemeAnalytics(id, params = {}) {
    try {
      const response = await api.get(`/themes/${id}/analytics`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch theme analytics');
    }
  }

  // Theme validation
  async validateTheme(themeData) {
    try {
      const response = await api.post('/themes/validate', themeData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to validate theme');
    }
  }

  // Theme CSS generation
  async generateThemeCSS(themeData) {
    try {
      const response = await api.post('/themes/generate-css', themeData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate theme CSS');
    }
  }

  // Theme search and filtering
  async searchThemes(query, params = {}) {
    try {
      const response = await api.get('/themes/search', {
        params: { q: query, ...params }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search themes');
    }
  }

  async getPopularThemes(limit = 10) {
    try {
      const response = await api.get('/themes/popular', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch popular themes');
    }
  }

  async getRecentThemes(limit = 10) {
    try {
      const response = await api.get('/themes/recent', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recent themes');
    }
  }

  // Theme favorites and ratings
  async addThemeToFavorites(id) {
    try {
      const response = await api.post(`/themes/${id}/favorite`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add theme to favorites');
    }
  }

  async removeThemeFromFavorites(id) {
    try {
      const response = await api.delete(`/themes/${id}/favorite`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove theme from favorites');
    }
  }

  async rateTheme(id, rating) {
    try {
      const response = await api.post(`/themes/${id}/rate`, { rating });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to rate theme');
    }
  }

  async getThemeRating(id) {
    try {
      const response = await api.get(`/themes/${id}/rating`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch theme rating');
    }
  }

  // Theme sharing and collaboration
  async shareTheme(id, shareData) {
    try {
      const response = await api.post(`/themes/${id}/share`, shareData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to share theme');
    }
  }

  async getSharedThemes() {
    try {
      const response = await api.get('/themes/shared');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch shared themes');
    }
  }

  // Theme versioning
  async getThemeVersions(id) {
    try {
      const response = await api.get(`/themes/${id}/versions`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch theme versions');
    }
  }

  async restoreThemeVersion(id, version) {
    try {
      const response = await api.post(`/themes/${id}/versions/${version}/restore`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to restore theme version');
    }
  }

  // Theme marketplace
  async getMarketplaceThemes(params = {}) {
    try {
      const response = await api.get('/themes/marketplace', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch marketplace themes');
    }
  }

  async publishToMarketplace(id, publishData) {
    try {
      const response = await api.post(`/themes/${id}/publish`, publishData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to publish theme to marketplace');
    }
  }

  async unpublishFromMarketplace(id) {
    try {
      const response = await api.post(`/themes/${id}/unpublish`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unpublish theme from marketplace');
    }
  }

  // Theme backup and restore
  async backupThemes() {
    try {
      const response = await api.get('/themes/backup', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to backup themes');
    }
  }

  async restoreThemes(file) {
    try {
      const formData = new FormData();
      formData.append('backup', file);
      
      const response = await api.post('/themes/restore', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to restore themes');
    }
  }
}

// Create and export singleton instance
const themeService = new ThemeService();
export { themeService };
export default themeService;
