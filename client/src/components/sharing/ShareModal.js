import React, { useState, useEffect } from 'react';
import { surveyService } from '../../services/surveyService';
import { 
  XMarkIcon,
  LinkIcon,
  QrCodeIcon,
  ShareIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  EyeIcon,
  GlobeAltIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

const ShareModal = ({ survey, onClose }) => {
  const [shareSettings, setShareSettings] = useState({
    allowAnonymous: true,
    requireLogin: false,
    password: '',
    expirationDate: '',
    maxResponses: 0,
    customMessage: ''
  });
  const [shareLink, setShareLink] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (survey) {
      loadShareSettings();
    }
  }, [survey]);

  const loadShareSettings = async () => {
    try {
      const settings = await surveyService.getShareSettings(survey.id);
      setShareSettings(prev => ({ ...prev, ...settings }));
    } catch (err) {
      console.error('Failed to load share settings:', err);
    }
  };

  const generateShareLink = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const linkData = await surveyService.generateShareLink(survey.id, shareSettings);
      setShareLink(linkData.url);
      
      // Generate QR code
      const qrData = await surveyService.generateQRCode(survey.id, {
        size: 200,
        format: 'png'
      });
      setQrCode(qrData.qrCodeUrl);
    } catch (err) {
      setError('Failed to generate share link');
      console.error('Share link error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      await surveyService.updateShareSettings(survey.id, shareSettings);
      await generateShareLink();
    } catch (err) {
      setError('Failed to save settings');
      console.error('Save settings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setShareSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getShareUrl = () => {
    if (shareLink) return shareLink;
    return `${window.location.origin}/survey/${survey.id}`;
  };

  const shareToSocial = (platform) => {
    const url = encodeURIComponent(getShareUrl());
    const title = encodeURIComponent(survey.title);
    const text = encodeURIComponent(shareSettings.customMessage || `Take this survey: ${survey.title}`);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${title}&body=${text}%20${url}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Share Survey</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Share Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Allow Anonymous Responses</label>
                    <p className="text-sm text-gray-500">Let users respond without logging in</p>
                  </div>
                  <button
                    onClick={() => handleInputChange('allowAnonymous', !shareSettings.allowAnonymous)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      shareSettings.allowAnonymous ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        shareSettings.allowAnonymous ? 'translate-x-6' : 'translate-x-1'
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
                    onClick={() => handleInputChange('requireLogin', !shareSettings.requireLogin)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      shareSettings.requireLogin ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        shareSettings.requireLogin ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Protection (Optional)
                  </label>
                  <input
                    type="password"
                    value={shareSettings.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter password to protect survey"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={shareSettings.expirationDate}
                    onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Responses (0 = unlimited)
                  </label>
                  <input
                    type="number"
                    value={shareSettings.maxResponses}
                    onChange={(e) => handleInputChange('maxResponses', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Share Message
                  </label>
                  <textarea
                    value={shareSettings.customMessage}
                    onChange={(e) => handleInputChange('customMessage', e.target.value)}
                    placeholder="Custom message to include when sharing..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Settings & Generate Link'}
                </button>
              </div>
            </div>

            {/* Share Options */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Options</h3>
              
              {/* Share Link */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Link
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={getShareUrl()}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                  <button
                    onClick={() => copyToClipboard(getShareUrl())}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* QR Code */}
              {qrCode && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    QR Code
                  </label>
                  <div className="flex items-center space-x-4">
                    <img src={qrCode} alt="QR Code" className="w-32 h-32 border border-gray-300 rounded-lg" />
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Scan to access survey</p>
                      <button
                        onClick={() => copyToClipboard(qrCode)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        Copy QR Code
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Sharing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Share on Social Media
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Twitter', icon: '🐦', color: 'bg-blue-400' },
                    { name: 'Facebook', icon: '📘', color: 'bg-blue-600' },
                    { name: 'LinkedIn', icon: '💼', color: 'bg-blue-700' },
                    { name: 'WhatsApp', icon: '💬', color: 'bg-green-500' },
                    { name: 'Email', icon: '📧', color: 'bg-gray-600' },
                    { name: 'Copy Link', icon: '🔗', color: 'bg-gray-500' }
                  ].map((platform) => (
                    <button
                      key={platform.name}
                      onClick={() => platform.name === 'Copy Link' ? copyToClipboard(getShareUrl()) : shareToSocial(platform.name.toLowerCase())}
                      className={`flex items-center space-x-2 px-3 py-2 ${platform.color} text-white rounded-lg hover:opacity-90 transition-opacity`}
                    >
                      <span>{platform.icon}</span>
                      <span className="text-sm font-medium">{platform.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="px-6 py-3 bg-red-50 border-t border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;

