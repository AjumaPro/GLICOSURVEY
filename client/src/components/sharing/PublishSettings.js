import React, { useState, useEffect } from 'react';
import { surveyService } from '../../services/surveyService';
import { 
  GlobeAltIcon,
  LockClosedIcon,
  EyeIcon,
  CalendarIcon,
  UserGroupIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const PublishSettings = ({ survey, onSave, onCancel }) => {
  const [settings, setSettings] = useState({
    status: 'draft', // draft, published, closed
    visibility: 'public', // public, private, password
    password: '',
    startDate: '',
    endDate: '',
    maxResponses: 0,
    allowMultipleResponses: false,
    requireLogin: false,
    showProgress: true,
    randomizeQuestions: false,
    showResults: false,
    customCSS: '',
    customJS: '',
    redirectUrl: '',
    thankYouMessage: 'Thank you for completing the survey!',
    emailNotifications: true,
    adminEmails: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (survey) {
      loadSettings();
    }
  }, [survey]);

  const loadSettings = async () => {
    try {
      const data = await surveyService.getPublishSettings(survey.id);
      setSettings(prev => ({ ...prev, ...data }));
    } catch (err) {
      console.error('Failed to load publish settings:', err);
    }
  };

  const validateSettings = () => {
    const errors = {};

    if (settings.visibility === 'password' && !settings.password.trim()) {
      errors.password = 'Password is required for password-protected surveys';
    }

    if (settings.startDate && settings.endDate && new Date(settings.startDate) >= new Date(settings.endDate)) {
      errors.endDate = 'End date must be after start date';
    }

    if (settings.maxResponses < 0) {
      errors.maxResponses = 'Maximum responses cannot be negative';
    }

    if (settings.adminEmails.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = settings.adminEmails.filter(email => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        errors.adminEmails = 'Please enter valid email addresses';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateSettings()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await surveyService.updatePublishSettings(survey.id, settings);
      onSave(result);
    } catch (err) {
      setError('Failed to save publish settings');
      console.error('Save settings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const addAdminEmail = () => {
    setSettings(prev => ({
      ...prev,
      adminEmails: [...prev.adminEmails, '']
    }));
  };

  const updateAdminEmail = (index, value) => {
    setSettings(prev => ({
      ...prev,
      adminEmails: prev.adminEmails.map((email, i) => i === index ? value : email)
    }));
  };

  const removeAdminEmail = (index) => {
    setSettings(prev => ({
      ...prev,
      adminEmails: prev.adminEmails.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'public': return <GlobeAltIcon className="w-5 h-5" />;
      case 'private': return <LockClosedIcon className="w-5 h-5" />;
      case 'password': return <LockClosedIcon className="w-5 h-5" />;
      default: return <EyeIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Publish Settings</h1>
        <p className="text-gray-600">Configure how your survey will be published and accessed</p>
      </div>

      <div className="space-y-8">
        {/* Status and Visibility */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CogIcon className="w-5 h-5 mr-2" />
            Basic Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Survey Status
              </label>
              <select
                value={settings.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </select>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(settings.status)}`}>
                  {settings.status.charAt(0).toUpperCase() + settings.status.slice(1)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <select
                value={settings.visibility}
                onChange={(e) => handleInputChange('visibility', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="password">Password Protected</option>
              </select>
              <div className="mt-2 flex items-center text-sm text-gray-600">
                {getVisibilityIcon(settings.visibility)}
                <span className="ml-2">
                  {settings.visibility === 'public' && 'Anyone with the link can access'}
                  {settings.visibility === 'private' && 'Only logged-in users can access'}
                  {settings.visibility === 'password' && 'Password required to access'}
                </span>
              </div>
            </div>
          </div>

          {settings.visibility === 'password' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={settings.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter password for survey access"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.password ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>
          )}
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            Schedule
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={settings.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={settings.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.endDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {validationErrors.endDate && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.endDate}</p>
              )}
            </div>
          </div>
        </div>

        {/* Response Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <UserGroupIcon className="w-5 h-5 mr-2" />
            Response Settings
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Responses (0 = unlimited)
              </label>
              <input
                type="number"
                value={settings.maxResponses}
                onChange={(e) => handleInputChange('maxResponses', parseInt(e.target.value) || 0)}
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.maxResponses ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {validationErrors.maxResponses && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.maxResponses}</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Allow Multiple Responses</label>
                  <p className="text-sm text-gray-500">Let the same user respond multiple times</p>
                </div>
                <button
                  onClick={() => handleInputChange('allowMultipleResponses', !settings.allowMultipleResponses)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.allowMultipleResponses ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.allowMultipleResponses ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Require Login</label>
                  <p className="text-sm text-gray-500">Force users to log in before responding</p>
                </div>
                <button
                  onClick={() => handleInputChange('requireLogin', !settings.requireLogin)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.requireLogin ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.requireLogin ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Show Progress</label>
                  <p className="text-sm text-gray-500">Display progress bar during survey</p>
                </div>
                <button
                  onClick={() => handleInputChange('showProgress', !settings.showProgress)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.showProgress ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showProgress ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Randomize Questions</label>
                  <p className="text-sm text-gray-500">Show questions in random order</p>
                </div>
                <button
                  onClick={() => handleInputChange('randomizeQuestions', !settings.randomizeQuestions)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.randomizeQuestions ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.randomizeQuestions ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Show Results</label>
                  <p className="text-sm text-gray-500">Display results after completion</p>
                </div>
                <button
                  onClick={() => handleInputChange('showResults', !settings.showResults)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.showResults ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showResults ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customization */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Customization</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thank You Message
              </label>
              <textarea
                value={settings.thankYouMessage}
                onChange={(e) => handleInputChange('thankYouMessage', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Redirect URL (Optional)
              </label>
              <input
                type="url"
                value={settings.redirectUrl}
                onChange={(e) => handleInputChange('redirectUrl', e.target.value)}
                placeholder="https://example.com/thank-you"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom CSS (Optional)
              </label>
              <textarea
                value={settings.customCSS}
                onChange={(e) => handleInputChange('customCSS', e.target.value)}
                rows={4}
                placeholder="/* Custom CSS styles */"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom JavaScript (Optional)
              </label>
              <textarea
                value={settings.customJS}
                onChange={(e) => handleInputChange('customJS', e.target.value)}
                rows={4}
                placeholder="// Custom JavaScript code"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                <p className="text-sm text-gray-500">Send email when new responses are received</p>
              </div>
              <button
                onClick={() => handleInputChange('emailNotifications', !settings.emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.emailNotifications && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Email Addresses
                </label>
                <div className="space-y-2">
                  {settings.adminEmails.map((email, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => updateAdminEmail(index, e.target.value)}
                        placeholder="admin@example.com"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => removeAdminEmail(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addAdminEmail}
                    className="px-3 py-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Email
                  </button>
                </div>
                {validationErrors.adminEmails && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.adminEmails}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishSettings;

