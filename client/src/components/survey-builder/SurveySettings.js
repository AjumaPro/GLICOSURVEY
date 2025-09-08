import React, { useState, useEffect } from 'react';
import { useSurveyBuilder } from '../../contexts/SurveyBuilderContext';
import { SURVEY_THEMES } from '../../services/questionTypesService';
import { 
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon as XIcon
} from '@heroicons/react/24/outline';

const SurveySettings = ({ onClose }) => {
  const { state, actions } = useSurveyBuilder();
  const [settings, setSettings] = useState(state.survey.settings);
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setSettings(state.survey.settings);
  }, [state.survey.settings]);

  useEffect(() => {
    validateSettings();
  }, [settings]);

  const validateSettings = () => {
    const newErrors = {};
    
    if (settings.maxResponses && settings.maxResponses < 0) {
      newErrors.maxResponses = 'Maximum responses must be a positive number';
    }
    
    if (settings.responseTimeout && settings.responseTimeout < 0) {
      newErrors.responseTimeout = 'Response timeout must be a positive number';
    }
    
    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  };

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleColorChange = (colorKey, value) => {
    setSettings(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }));
  };

  const handleThemeChange = (themeKey) => {
    const theme = SURVEY_THEMES[themeKey];
    if (theme) {
      setSettings(prev => ({
        ...prev,
        theme: themeKey,
        colors: { ...theme.colors }
      }));
    }
  };

  const handleSave = () => {
    if (!isValid) return;
    
    actions.updateSurvey({ settings });
    onClose && onClose();
  };

  const handleCancel = () => {
    setSettings(state.survey.settings);
    onClose && onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Survey Settings</h2>
            <button
              onClick={handleCancel}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-8">
            {/* General Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Allow Anonymous Responses</label>
                    <p className="text-sm text-gray-500">Allow users to respond without logging in</p>
                  </div>
                  <button
                    onClick={() => handleInputChange('allowAnonymous', !settings.allowAnonymous)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.allowAnonymous ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.allowAnonymous ? 'translate-x-6' : 'translate-x-1'
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
                    <label className="text-sm font-medium text-gray-700">Show Progress Bar</label>
                    <p className="text-sm text-gray-500">Display progress indicator during survey</p>
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
                    <label className="text-sm font-medium text-gray-700">Allow Back Navigation</label>
                    <p className="text-sm text-gray-500">Allow users to go back to previous questions</p>
                  </div>
                  <button
                    onClick={() => handleInputChange('allowBack', !settings.allowBack)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.allowBack ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.allowBack ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Auto-save Responses</label>
                    <p className="text-sm text-gray-500">Automatically save responses as users type</p>
                  </div>
                  <button
                    onClick={() => handleInputChange('autoSave', !settings.autoSave)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.autoSave ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Response Limits */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Limits</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Responses (0 = unlimited)
                  </label>
                  <input
                    type="number"
                    value={settings.maxResponses || ''}
                    onChange={(e) => handleInputChange('maxResponses', parseInt(e.target.value) || 0)}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.maxResponses ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.maxResponses && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxResponses}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Timeout (seconds, 0 = no timeout)
                  </label>
                  <input
                    type="number"
                    value={settings.responseTimeout || ''}
                    onChange={(e) => handleInputChange('responseTimeout', parseInt(e.target.value) || 0)}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.responseTimeout ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.responseTimeout && (
                    <p className="mt-1 text-sm text-red-600">{errors.responseTimeout}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Theme Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme & Colors</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme Preset
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(SURVEY_THEMES).map(([key, theme]) => (
                      <button
                        key={key}
                        onClick={() => handleThemeChange(key)}
                        className={`p-3 border-2 rounded-lg text-left transition-all ${
                          settings.theme === key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: theme.colors.primary }}
                          />
                          <span className="font-medium text-gray-900">{theme.name}</span>
                        </div>
                        <div className="flex space-x-1">
                          {Object.values(theme.colors).slice(0, 5).map((color, index) => (
                            <div
                              key={index}
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Colors
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(settings.colors).map(([colorKey, colorValue]) => (
                      <div key={colorKey}>
                        <label className="block text-sm text-gray-600 mb-1 capitalize">
                          {colorKey.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={colorValue}
                            onChange={(e) => handleColorChange(colorKey, e.target.value)}
                            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={colorValue}
                            onChange={(e) => handleColorChange(colorKey, e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {!isValid && (
                <div className="flex items-center space-x-1 text-red-600">
                  <XIcon className="w-4 h-4" />
                  <span className="text-sm">Please fix validation errors</span>
                </div>
              )}
              {isValid && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckIcon className="w-4 h-4" />
                  <span className="text-sm">Settings are valid</span>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isValid}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveySettings;

