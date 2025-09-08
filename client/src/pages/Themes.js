import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Palette,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Search,
  Star,
  Heart,
  Settings,
  Layout,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const Themes = () => {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockThemes = [
        {
          id: 1,
          name: 'Modern Blue',
          description: 'Clean and professional blue theme with modern typography',
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
          layout: 'centered',
          isDefault: true,
          isPremium: false,
          usageCount: 45,
          rating: 4.8,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          preview: '/api/themes/1/preview'
        },
        {
          id: 2,
          name: 'Warm Orange',
          description: 'Friendly and approachable orange theme perfect for customer surveys',
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
          layout: 'centered',
          isDefault: false,
          isPremium: false,
          usageCount: 23,
          rating: 4.6,
          created_at: '2024-01-14T15:30:00Z',
          updated_at: '2024-01-14T15:30:00Z',
          preview: '/api/themes/2/preview'
        },
        {
          id: 3,
          name: 'Elegant Purple',
          description: 'Sophisticated purple theme with elegant design elements',
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
          layout: 'centered',
          isDefault: false,
          isPremium: true,
          usageCount: 12,
          rating: 4.9,
          created_at: '2024-01-13T09:15:00Z',
          updated_at: '2024-01-13T09:15:00Z',
          preview: '/api/themes/3/preview'
        },
        {
          id: 4,
          name: 'Minimal Gray',
          description: 'Clean minimal design with subtle gray tones',
          category: 'minimal',
          colors: {
            primary: '#6b7280',
            secondary: '#9ca3af',
            accent: '#10b981',
            background: '#ffffff',
            text: '#111827'
          },
          typography: {
            fontFamily: 'System UI, sans-serif',
            headingSize: '1.875rem',
            bodySize: '1rem'
          },
          layout: 'centered',
          isDefault: false,
          isPremium: false,
          usageCount: 34,
          rating: 4.7,
          created_at: '2024-01-12T14:20:00Z',
          updated_at: '2024-01-12T14:20:00Z',
          preview: '/api/themes/4/preview'
        },
        {
          id: 5,
          name: 'Vibrant Green',
          description: 'Energetic green theme for health and wellness surveys',
          category: 'vibrant',
          colors: {
            primary: '#10b981',
            secondary: '#64748b',
            accent: '#34d399',
            background: '#ecfdf5',
            text: '#064e3b'
          },
          typography: {
            fontFamily: 'Nunito, sans-serif',
            headingSize: '2rem',
            bodySize: '1.125rem'
          },
          layout: 'centered',
          isDefault: false,
          isPremium: false,
          usageCount: 18,
          rating: 4.5,
          created_at: '2024-01-11T11:45:00Z',
          updated_at: '2024-01-11T11:45:00Z',
          preview: '/api/themes/5/preview'
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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this theme? This action cannot be undone.')) {
      try {
        // await axios.delete(`/api/themes/${id}`);
        toast.success('Theme deleted successfully');
        fetchThemes();
      } catch (error) {
        console.error('Error deleting theme:', error);
        toast.error('Failed to delete theme');
      }
    }
  };

  const handleDuplicate = async (id) => {
    try {
      // await axios.post(`/api/themes/${id}/duplicate`);
      toast.success('Theme duplicated successfully');
      fetchThemes();
    } catch (error) {
      console.error('Error duplicating theme:', error);
      toast.error('Failed to duplicate theme');
    }
  };

  const handleExport = async (id) => {
    try {
      // const response = await axios.get(`/api/themes/${id}/export`);
      // Download logic here
      toast.success('Theme exported successfully');
    } catch (error) {
      console.error('Error exporting theme:', error);
      toast.error('Failed to export theme');
    }
  };

  const filteredThemes = themes
    .filter(theme => {
      const matchesSearch = theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          theme.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterCategory === 'all' || theme.category === filterCategory;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'rating':
          return b.rating - a.rating;
        case 'created_at':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'professional':
        return <Settings className="h-3 w-3" />;
      case 'friendly':
        return <Heart className="h-3 w-3" />;
      case 'elegant':
        return <Sparkles className="h-3 w-3" />;
      case 'minimal':
        return <Layout className="h-3 w-3" />;
      case 'vibrant':
        return <Palette className="h-3 w-3" />;
      default:
        return <Palette className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
          <span className="text-gray-600">Loading themes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Survey Themes</h1>
          <p className="text-gray-600 mt-1">Create and manage beautiful survey themes</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchThemes}
            className="btn-secondary"
            title="Refresh themes"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <Link
            to="/themes/create"
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Theme
          </Link>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/themes/create"
                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Theme
              </Link>
              <Link
                to="/themes/import"
                className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm font-medium hover:bg-green-100 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Theme
              </Link>
              <Link
                to="/themes/gallery"
                className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-sm font-medium hover:bg-purple-100 transition-colors"
              >
                <Palette className="h-4 w-4 mr-2" />
                Theme Gallery
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search themes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex space-x-2">
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
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input max-w-xs"
            >
              <option value="created_at">Newest First</option>
              <option value="name">Alphabetical</option>
              <option value="usage">Most Used</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Themes Grid */}
      {filteredThemes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
          <Palette className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {themes.length === 0 ? 'No themes yet' : 'No themes match your filters'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {themes.length === 0 
              ? 'Create your first theme to start customizing your surveys'
              : 'Try adjusting your search terms or filters to find what you\'re looking for'
            }
          </p>
          {themes.length === 0 && (
            <Link
              to="/themes/create"
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Theme
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredThemes.map((theme) => (
            <div key={theme.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              {/* Theme Preview */}
              <div className="relative">
                <div 
                  className="h-48 rounded-t-lg"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                  <div className="absolute top-4 left-4 right-4">
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
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-white text-sm font-medium">{theme.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-white">
                      <h3 className="font-semibold text-lg mb-1" style={{ fontFamily: theme.typography.fontFamily }}>
                        Sample Survey
                      </h3>
                      <p className="text-sm opacity-90">How satisfied are you?</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Theme Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                      {theme.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {theme.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getCategoryColor(theme.category)}`}>
                      {getCategoryIcon(theme.category)}
                      <span className="ml-1 capitalize">{theme.category}</span>
                    </span>
                  </div>
                </div>

                {/* Theme Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{theme.usageCount} uses</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4" />
                      <span>{theme.rating}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(theme.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Color Palette */}
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Color Palette</h4>
                  <div className="flex space-x-2">
                    <div 
                      className="w-6 h-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: theme.colors.primary }}
                      title="Primary"
                    ></div>
                    <div 
                      className="w-6 h-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: theme.colors.secondary }}
                      title="Secondary"
                    ></div>
                    <div 
                      className="w-6 h-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: theme.colors.accent }}
                      title="Accent"
                    ></div>
                    <div 
                      className="w-6 h-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: theme.colors.background }}
                      title="Background"
                    ></div>
                    <div 
                      className="w-6 h-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: theme.colors.text }}
                      title="Text"
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    <Link
                      to={`/themes/${theme.id}/preview`}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                      title="Preview Theme"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/themes/${theme.id}/edit`}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                      title="Edit Theme"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDuplicate(theme.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                      title="Duplicate Theme"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleExport(theme.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                      title="Export Theme"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    {!theme.isDefault && (
                      <button
                        onClick={() => handleDelete(theme.id)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50"
                        title="Delete Theme"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {themes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{themes.length}</div>
              <div className="text-sm text-gray-600">Total Themes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {themes.filter(t => t.isPremium).length}
              </div>
              <div className="text-sm text-gray-600">Premium Themes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {themes.reduce((sum, t) => sum + t.usageCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Uses</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {(themes.reduce((sum, t) => sum + t.rating, 0) / themes.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Themes;
