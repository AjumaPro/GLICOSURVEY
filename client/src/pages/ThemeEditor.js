import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  Eye,
  Undo2,
  Redo2,
  Download,
  Upload,
  Palette,
  Type,
  Layout,
  Image,
  Settings,
  Sparkles,
  Copy,
  Trash2,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ThemeEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'create';
  
  const [theme, setTheme] = useState({
    name: '',
    description: '',
    category: 'professional',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#10b981',
      background: '#ffffff',
      text: '#1e293b',
      border: '#e2e8f0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      headingSize: '2rem',
      bodySize: '1rem',
      lineHeight: '1.6',
      fontWeight: '400'
    },
    layout: {
      maxWidth: '800px',
      padding: '2rem',
      borderRadius: '0.75rem',
      shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    },
    components: {
      buttonRadius: '0.5rem',
      inputRadius: '0.5rem',
      cardRadius: '0.75rem',
      animationSpeed: '0.2s'
    }
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('colors');

  const fontOptions = [
    'Inter, sans-serif',
    'Poppins, sans-serif',
    'Roboto, sans-serif',
    'Open Sans, sans-serif',
    'Lato, sans-serif',
    'Montserrat, sans-serif',
    'Playfair Display, serif',
    'Merriweather, serif',
    'System UI, sans-serif',
    'Arial, sans-serif'
  ];

  const categoryOptions = [
    { value: 'professional', label: 'Professional', icon: '💼' },
    { value: 'friendly', label: 'Friendly', icon: '😊' },
    { value: 'elegant', label: 'Elegant', icon: '✨' },
    { value: 'minimal', label: 'Minimal', icon: '📐' },
    { value: 'vibrant', label: 'Vibrant', icon: '🎨' },
    { value: 'corporate', label: 'Corporate', icon: '🏢' },
    { value: 'creative', label: 'Creative', icon: '🎭' },
    { value: 'modern', label: 'Modern', icon: '🚀' }
  ];

  useEffect(() => {
    if (isEditing) {
      fetchTheme();
    }
  }, [id, isEditing]);

  const fetchTheme = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockTheme = {
        id: parseInt(id),
        name: 'Modern Blue',
        description: 'Clean and professional blue theme with modern typography',
        category: 'professional',
        colors: {
          primary: '#3b82f6',
          secondary: '#64748b',
          accent: '#10b981',
          background: '#ffffff',
          text: '#1e293b',
          border: '#e2e8f0',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444'
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          headingSize: '2rem',
          bodySize: '1rem',
          lineHeight: '1.6',
          fontWeight: '400'
        },
        layout: {
          maxWidth: '800px',
          padding: '2rem',
          borderRadius: '0.75rem',
          shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        },
        components: {
          buttonRadius: '0.5rem',
          inputRadius: '0.5rem',
          cardRadius: '0.75rem',
          animationSpeed: '0.2s'
        }
      };
      setTheme(mockTheme);
    } catch (error) {
      console.error('Error fetching theme:', error);
      toast.error('Failed to load theme');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (isEditing) {
        // await axios.put(`/api/themes/${id}`, theme);
        toast.success('Theme updated successfully');
      } else {
        // await axios.post('/api/themes', theme);
        toast.success('Theme created successfully');
        navigate('/themes');
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      toast.error('Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  const handleColorChange = (colorKey, value) => {
    setTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }));
  };

  const handleTypographyChange = (key, value) => {
    setTheme(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        [key]: value
      }
    }));
  };

  const handleLayoutChange = (key, value) => {
    setTheme(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        [key]: value
      }
    }));
  };

  const handleComponentChange = (key, value) => {
    setTheme(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [key]: value
      }
    }));
  };

  const generateCSS = () => {
    return `
:root {
  --theme-primary: ${theme.colors.primary};
  --theme-secondary: ${theme.colors.secondary};
  --theme-accent: ${theme.colors.accent};
  --theme-background: ${theme.colors.background};
  --theme-text: ${theme.colors.text};
  --theme-border: ${theme.colors.border};
  --theme-success: ${theme.colors.success};
  --theme-warning: ${theme.colors.warning};
  --theme-error: ${theme.colors.error};
}

.survey-container {
  font-family: ${theme.typography.fontFamily};
  max-width: ${theme.layout.maxWidth};
  padding: ${theme.layout.padding};
  background: ${theme.colors.background};
  border-radius: ${theme.layout.borderRadius};
  box-shadow: ${theme.layout.shadow};
  color: ${theme.colors.text};
}

.survey-title {
  font-size: ${theme.typography.headingSize};
  font-weight: 600;
  color: ${theme.colors.primary};
  margin-bottom: 1rem;
}

.survey-description {
  font-size: ${theme.typography.bodySize};
  line-height: ${theme.typography.lineHeight};
  color: ${theme.colors.text};
  margin-bottom: 2rem;
}

.survey-button {
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.components.buttonRadius};
  padding: 0.75rem 1.5rem;
  font-size: ${theme.typography.bodySize};
  transition: all ${theme.components.animationSpeed} ease;
}

.survey-button:hover {
  background: ${theme.colors.accent};
  transform: translateY(-1px);
}

.survey-input {
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.components.inputRadius};
  padding: 0.75rem 1rem;
  font-size: ${theme.typography.bodySize};
  transition: border-color ${theme.components.animationSpeed} ease;
}

.survey-input:focus {
  outline: none;
  border-color: ${theme.colors.primary};
}

.survey-card {
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.components.cardRadius};
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all ${theme.components.animationSpeed} ease;
}

.survey-card:hover {
  border-color: ${theme.colors.primary};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
    `.trim();
  };

  const tabs = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'components', label: 'Components', icon: Settings },
    { id: 'preview', label: 'Preview', icon: Eye }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
          <span className="text-gray-600">Loading theme...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/themes')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {isEditing ? 'Edit Theme' : 'Create Theme'}
                </h1>
                <p className="text-sm text-gray-600">
                  {isEditing ? 'Customize your theme settings' : 'Design a new survey theme'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`btn-secondary ${previewMode ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Edit Mode' : 'Preview'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save Theme'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Theme Settings */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Basic Info */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Theme Name
                    </label>
                    <input
                      type="text"
                      value={theme.name}
                      onChange={(e) => setTheme(prev => ({ ...prev, name: e.target.value }))}
                      className="input"
                      placeholder="Enter theme name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={theme.description}
                      onChange={(e) => setTheme(prev => ({ ...prev, description: e.target.value }))}
                      className="input"
                      rows={3}
                      placeholder="Describe your theme"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={theme.category}
                      onChange={(e) => setTheme(prev => ({ ...prev, category: e.target.value }))}
                      className="input"
                    >
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.icon} {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-4 w-4 inline mr-2" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'colors' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Color Palette</h4>
                    {Object.entries(theme.colors).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-3">
                        <div
                          className="w-8 h-8 rounded border border-gray-200"
                          style={{ backgroundColor: value }}
                        ></div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => handleColorChange(key, e.target.value)}
                            className="w-full h-8 border border-gray-200 rounded"
                          />
                        </div>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          className="w-20 text-xs font-mono border border-gray-200 rounded px-2 py-1"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'typography' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Typography</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Font Family
                      </label>
                      <select
                        value={theme.typography.fontFamily}
                        onChange={(e) => handleTypographyChange('fontFamily', e.target.value)}
                        className="input"
                      >
                        {fontOptions.map(font => (
                          <option key={font} value={font}>
                            {font}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Heading Size
                      </label>
                      <input
                        type="text"
                        value={theme.typography.headingSize}
                        onChange={(e) => handleTypographyChange('headingSize', e.target.value)}
                        className="input"
                        placeholder="2rem"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Body Size
                      </label>
                      <input
                        type="text"
                        value={theme.typography.bodySize}
                        onChange={(e) => handleTypographyChange('bodySize', e.target.value)}
                        className="input"
                        placeholder="1rem"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Line Height
                      </label>
                      <input
                        type="text"
                        value={theme.typography.lineHeight}
                        onChange={(e) => handleTypographyChange('lineHeight', e.target.value)}
                        className="input"
                        placeholder="1.6"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'layout' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Layout</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Width
                      </label>
                      <input
                        type="text"
                        value={theme.layout.maxWidth}
                        onChange={(e) => handleLayoutChange('maxWidth', e.target.value)}
                        className="input"
                        placeholder="800px"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Padding
                      </label>
                      <input
                        type="text"
                        value={theme.layout.padding}
                        onChange={(e) => handleLayoutChange('padding', e.target.value)}
                        className="input"
                        placeholder="2rem"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Border Radius
                      </label>
                      <input
                        type="text"
                        value={theme.layout.borderRadius}
                        onChange={(e) => handleLayoutChange('borderRadius', e.target.value)}
                        className="input"
                        placeholder="0.75rem"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Box Shadow
                      </label>
                      <input
                        type="text"
                        value={theme.layout.shadow}
                        onChange={(e) => handleLayoutChange('shadow', e.target.value)}
                        className="input"
                        placeholder="0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'components' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Components</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Button Radius
                      </label>
                      <input
                        type="text"
                        value={theme.components.buttonRadius}
                        onChange={(e) => handleComponentChange('buttonRadius', e.target.value)}
                        className="input"
                        placeholder="0.5rem"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Input Radius
                      </label>
                      <input
                        type="text"
                        value={theme.components.inputRadius}
                        onChange={(e) => handleComponentChange('inputRadius', e.target.value)}
                        className="input"
                        placeholder="0.5rem"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Radius
                      </label>
                      <input
                        type="text"
                        value={theme.components.cardRadius}
                        onChange={(e) => handleComponentChange('cardRadius', e.target.value)}
                        className="input"
                        placeholder="0.75rem"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Animation Speed
                      </label>
                      <input
                        type="text"
                        value={theme.components.animationSpeed}
                        onChange={(e) => handleComponentChange('animationSpeed', e.target.value)}
                        className="input"
                        placeholder="0.2s"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'preview' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">CSS Output</h4>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                      <pre>{generateCSS()}</pre>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(generateCSS())}
                      className="btn-secondary w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy CSS
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Live Preview</h3>
                <p className="text-sm text-gray-600">See how your theme looks in real-time</p>
              </div>
              <div className="p-6">
                <div 
                  className="survey-container"
                  style={{
                    fontFamily: theme.typography.fontFamily,
                    maxWidth: theme.layout.maxWidth,
                    padding: theme.layout.padding,
                    background: theme.colors.background,
                    borderRadius: theme.layout.borderRadius,
                    boxShadow: theme.layout.shadow,
                    color: theme.colors.text,
                    margin: '0 auto'
                  }}
                >
                  <h1 
                    className="survey-title"
                    style={{
                      fontSize: theme.typography.headingSize,
                      fontWeight: 600,
                      color: theme.colors.primary,
                      marginBottom: '1rem'
                    }}
                  >
                    Customer Satisfaction Survey
                  </h1>
                  <p 
                    className="survey-description"
                    style={{
                      fontSize: theme.typography.bodySize,
                      lineHeight: theme.typography.lineHeight,
                      color: theme.colors.text,
                      marginBottom: '2rem'
                    }}
                  >
                    Help us improve our services by sharing your feedback
                  </p>
                  
                  <div 
                    className="survey-card"
                    style={{
                      background: theme.colors.background,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.components.cardRadius,
                      padding: '1.5rem',
                      marginBottom: '1rem',
                      transition: `all ${theme.components.animationSpeed} ease`
                    }}
                  >
                    <h3 
                      style={{
                        fontSize: theme.typography.headingSize,
                        fontWeight: 600,
                        color: theme.colors.text,
                        marginBottom: '1rem'
                      }}
                    >
                      How satisfied are you with our service?
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input type="radio" name="satisfaction" className="text-blue-600" />
                        <span style={{ fontSize: theme.typography.bodySize }}>Very Satisfied</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="radio" name="satisfaction" className="text-blue-600" />
                        <span style={{ fontSize: theme.typography.bodySize }}>Satisfied</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="radio" name="satisfaction" className="text-blue-600" />
                        <span style={{ fontSize: theme.typography.bodySize }}>Neutral</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="radio" name="satisfaction" className="text-blue-600" />
                        <span style={{ fontSize: theme.typography.bodySize }}>Dissatisfied</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      className="survey-button"
                      style={{
                        background: theme.colors.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: theme.components.buttonRadius,
                        padding: '0.75rem 1.5rem',
                        fontSize: theme.typography.bodySize,
                        transition: `all ${theme.components.animationSpeed} ease`,
                        cursor: 'pointer'
                      }}
                    >
                      Submit Survey
                    </button>
                    <button
                      className="survey-button"
                      style={{
                        background: 'transparent',
                        color: theme.colors.primary,
                        border: `2px solid ${theme.colors.primary}`,
                        borderRadius: theme.components.buttonRadius,
                        padding: '0.75rem 1.5rem',
                        fontSize: theme.typography.bodySize,
                        transition: `all ${theme.components.animationSpeed} ease`,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeEditor;
