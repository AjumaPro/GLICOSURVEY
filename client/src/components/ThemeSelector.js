import React, { useState, useEffect } from 'react';
import { Palette, Eye, Check, Star, Heart, Download, Copy } from 'lucide-react';
import themeService from '../services/themeService';
import toast from 'react-hot-toast';

const ThemeSelector = ({ 
  selectedTheme, 
  onThemeSelect, 
  onClose, 
  showPreview = true,
  showActions = true 
}) => {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewTheme, setPreviewTheme] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      // For now, use mock data - replace with actual API call
      const mockThemes = [
        {
          id: 1,
          name: 'Modern Blue',
          description: 'Clean and professional blue theme',
          category: 'professional',
          colors: {
            primary: '#3b82f6',
            secondary: '#64748b',
            accent: '#10b981',
            background: '#ffffff',
            text: '#1e293b'
          },
          typography: {
            fontFamily: 'Inter, sans-serif',
            headingSize: '2rem',
            bodySize: '1rem'
          },
          usageCount: 45,
          rating: 4.8,
          isDefault: true,
          isPremium: false
        },
        {
          id: 2,
          name: 'Warm Orange',
          description: 'Friendly and approachable orange theme',
          category: 'friendly',
          colors: {
            primary: '#f97316',
            secondary: '#64748b',
            accent: '#f59e0b',
            background: '#fef7ed',
            text: '#1e293b'
          },
          typography: {
            fontFamily: 'Poppins, sans-serif',
            headingSize: '2.25rem',
            bodySize: '1.125rem'
          },
          usageCount: 23,
          rating: 4.6,
          isDefault: false,
          isPremium: false
        },
        {
          id: 3,
          name: 'Elegant Purple',
          description: 'Sophisticated purple theme',
          category: 'elegant',
          colors: {
            primary: '#8b5cf6',
            secondary: '#64748b',
            accent: '#a855f7',
            background: '#faf5ff',
            text: '#1e293b'
          },
          typography: {
            fontFamily: 'Playfair Display, serif',
            headingSize: '2.5rem',
            bodySize: '1.125rem'
          },
          usageCount: 12,
          rating: 4.9,
          isDefault: false,
          isPremium: true
        }
      ];
      setThemes(mockThemes);
    } catch (error) {
      console.error('Error fetching themes:', error);
      toast.error('Failed to load themes');
    } finally {
      setLoading(false);
    }
  };

  const filteredThemes = themes.filter(theme => {
    const matchesSearch = theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         theme.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || theme.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const getCategoryColor = (category) => {
    switch (category) {
      case 'professional':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'friendly':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'elegant':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'minimal':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'vibrant':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleThemeSelect = (theme) => {
    onThemeSelect(theme);
    if (onClose) onClose();
  };

  const handlePreview = (theme) => {
    setPreviewTheme(theme);
  };

  const handleDuplicate = async (theme) => {
    try {
      // await themeService.duplicateTheme(theme.id);
      toast.success('Theme duplicated successfully');
      fetchThemes();
    } catch (error) {
      console.error('Error duplicating theme:', error);
      toast.error('Failed to duplicate theme');
    }
  };

  const handleExport = async (theme) => {
    try {
      // await themeService.exportTheme(theme.id);
      toast.success('Theme exported successfully');
    } catch (error) {
      console.error('Error exporting theme:', error);
      toast.error('Failed to export theme');
    }
  };

  const generatePreviewHTML = (theme) => {
    return `
      <div style="
        font-family: ${theme.typography.fontFamily};
        max-width: 400px;
        margin: 0 auto;
        background: ${theme.colors.background};
        border-radius: 0.75rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      ">
        <div style="
          background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%);
          color: white;
          padding: 1.5rem;
          text-align: center;
        ">
          <h2 style="
            font-size: ${theme.typography.headingSize};
            font-weight: 700;
            margin: 0 0 0.5rem 0;
          ">Sample Survey</h2>
          <p style="opacity: 0.9; margin: 0;">Preview of your theme</p>
        </div>
        <div style="padding: 1.5rem;">
          <div style="
            background: ${theme.colors.background};
            border: 1px solid ${theme.colors.border || '#e2e8f0'};
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 1rem;
          ">
            <h3 style="
              font-size: 1.25rem;
              font-weight: 600;
              margin: 0 0 1rem 0;
              color: ${theme.colors.text};
            ">How satisfied are you?</h3>
            <div style="display: flex; gap: 0.5rem;">
              <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="radio" name="satisfaction" style="accent-color: ${theme.colors.primary};">
                <span style="color: ${theme.colors.text};">Very Satisfied</span>
              </label>
            </div>
          </div>
          <button style="
            background: ${theme.colors.primary};
            color: white;
            border: none;
            border-radius: 0.5rem;
            padding: 0.75rem 1.5rem;
            font-size: ${theme.typography.bodySize};
            cursor: pointer;
            width: 100%;
          ">Submit Survey</button>
        </div>
      </div>
    `;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span className="text-gray-600">Loading themes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Palette className="h-6 w-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Select Theme</h2>
              <p className="text-sm text-gray-600">Choose a theme for your survey</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search themes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input max-w-xs"
          >
            <option value="all">All Categories</option>
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="elegant">Elegant</option>
            <option value="minimal">Minimal</option>
            <option value="vibrant">Vibrant</option>
          </select>
        </div>
      </div>

      {/* Themes Grid */}
      <div className="p-6">
        {filteredThemes.length === 0 ? (
          <div className="text-center py-8">
            <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No themes found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredThemes.map((theme) => (
              <div
                key={theme.id}
                className={`relative bg-white border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                  selectedTheme?.id === theme.id
                    ? 'border-primary-500 ring-2 ring-primary-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Theme Preview */}
                <div className="h-32 relative overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`
                    }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                    <div className="absolute top-3 left-3 right-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          {theme.isDefault && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                              Default
                            </span>
                          )}
                          {theme.isPremium && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                              Premium
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-white text-xs font-medium">{theme.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="text-white">
                        <h3 className="font-semibold text-sm mb-1" style={{ fontFamily: theme.typography.fontFamily }}>
                          Sample Survey
                        </h3>
                        <p className="text-xs opacity-90">Theme Preview</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Theme Info */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{theme.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{theme.description}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ml-2 ${getCategoryColor(theme.category)}`}>
                      {theme.category}
                    </span>
                  </div>

                  {/* Color Palette */}
                  <div className="flex space-x-1 mb-3">
                    {Object.entries(theme.colors).slice(0, 5).map(([key, value]) => (
                      <div
                        key={key}
                        className="w-4 h-4 rounded border border-gray-200"
                        style={{ backgroundColor: value }}
                        title={`${key}: ${value}`}
                      ></div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{theme.usageCount} uses</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3" />
                        <span>{theme.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      {showPreview && (
                        <button
                          onClick={() => handlePreview(theme)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded hover:bg-gray-100"
                          title="Preview Theme"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {showActions && (
                        <>
                          <button
                            onClick={() => handleDuplicate(theme)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded hover:bg-gray-100"
                            title="Duplicate Theme"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleExport(theme)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded hover:bg-gray-100"
                            title="Export Theme"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleThemeSelect(theme)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        selectedTheme?.id === theme.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                      }`}
                    >
                      {selectedTheme?.id === theme.id ? (
                        <>
                          <Check className="h-4 w-4 inline mr-1" />
                          Selected
                        </>
                      ) : (
                        'Select'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewTheme && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{previewTheme.name} Preview</h3>
                <p className="text-sm text-gray-600">{previewTheme.description}</p>
              </div>
              <button
                onClick={() => setPreviewTheme(null)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div dangerouslySetInnerHTML={{ __html: generatePreviewHTML(previewTheme) }} />
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setPreviewTheme(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
                <button
                  onClick={() => handleThemeSelect(previewTheme)}
                  className="btn-primary"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Select Theme
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
