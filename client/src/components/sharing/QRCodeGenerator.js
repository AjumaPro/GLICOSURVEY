import React, { useState, useEffect } from 'react';
import { surveyService } from '../../services/surveyService';
import { 
  QrCodeIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  EyeIcon,
  CogIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const QRCodeGenerator = ({ survey, onClose }) => {
  const [qrOptions, setQrOptions] = useState({
    size: 200,
    format: 'png',
    errorCorrectionLevel: 'M',
    margin: 4,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    logo: {
      enabled: false,
      url: '',
      size: 50
    },
    text: {
      enabled: true,
      content: survey?.title || 'Survey',
      position: 'bottom',
      fontSize: 14
    }
  });
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const qrData = await surveyService.generateQRCode(survey.id, {
        size: qrOptions.size,
        format: qrOptions.format,
        errorCorrectionLevel: qrOptions.errorCorrectionLevel,
        margin: qrOptions.margin,
        color: qrOptions.color,
        logo: qrOptions.logo.enabled ? qrOptions.logo : null,
        text: qrOptions.text.enabled ? qrOptions.text : null
      });
      
      setQrCodeUrl(qrData.qrCodeUrl);
    } catch (err) {
      setError('Failed to generate QR code');
      console.error('QR code generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (survey) {
      generateQRCode();
    }
  }, [survey, qrOptions, generateQRCode]);

  const downloadQRCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `survey-${survey.id}-qr-code.${qrOptions.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download QR code:', err);
    }
  };

  const copyQRCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy QR code:', err);
    }
  };

  const handleOptionChange = (path, value) => {
    setQrOptions(prev => {
      const newOptions = { ...prev };
      const keys = path.split('.');
      let current = newOptions;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newOptions;
    });
  };

  const getErrorCorrectionLevels = () => [
    { value: 'L', label: 'Low (7%)', description: 'Suitable for clean environments' },
    { value: 'M', label: 'Medium (15%)', description: 'Good balance of size and error correction' },
    { value: 'Q', label: 'Quartile (25%)', description: 'Better error correction' },
    { value: 'H', label: 'High (30%)', description: 'Maximum error correction' }
  ];

  const getFormats = () => [
    { value: 'png', label: 'PNG', description: 'Best for web and print' },
    { value: 'svg', label: 'SVG', description: 'Scalable vector format' },
    { value: 'jpg', label: 'JPG', description: 'Smaller file size' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">QR Code Generator</h2>
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
            {/* QR Code Options */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CogIcon className="w-5 h-5 mr-2" />
                QR Code Options
              </h3>
              
              <div className="space-y-6">
                {/* Basic Settings */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-800">Basic Settings</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Size (px)
                      </label>
                      <input
                        type="number"
                        value={qrOptions.size}
                        onChange={(e) => handleOptionChange('size', parseInt(e.target.value) || 200)}
                        min="100"
                        max="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Format
                      </label>
                      <select
                        value={qrOptions.format}
                        onChange={(e) => handleOptionChange('format', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {getFormats().map(format => (
                          <option key={format.value} value={format.value}>
                            {format.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Error Correction Level
                    </label>
                    <select
                      value={qrOptions.errorCorrectionLevel}
                      onChange={(e) => handleOptionChange('errorCorrectionLevel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {getErrorCorrectionLevels().map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                      {getErrorCorrectionLevels().find(l => l.value === qrOptions.errorCorrectionLevel)?.description}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Margin
                    </label>
                    <input
                      type="number"
                      value={qrOptions.margin}
                      onChange={(e) => handleOptionChange('margin', parseInt(e.target.value) || 4)}
                      min="0"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-800">Colors</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dark Color
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={qrOptions.color.dark}
                          onChange={(e) => handleOptionChange('color.dark', e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={qrOptions.color.dark}
                          onChange={(e) => handleOptionChange('color.dark', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Light Color
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={qrOptions.color.light}
                          onChange={(e) => handleOptionChange('color.light', e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={qrOptions.color.light}
                          onChange={(e) => handleOptionChange('color.light', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logo */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium text-gray-800">Logo</h4>
                    <button
                      onClick={() => handleOptionChange('logo.enabled', !qrOptions.logo.enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        qrOptions.logo.enabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          qrOptions.logo.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {qrOptions.logo.enabled && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Logo URL
                        </label>
                        <input
                          type="url"
                          value={qrOptions.logo.url}
                          onChange={(e) => handleOptionChange('logo.url', e.target.value)}
                          placeholder="https://example.com/logo.png"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Logo Size (px)
                        </label>
                        <input
                          type="number"
                          value={qrOptions.logo.size}
                          onChange={(e) => handleOptionChange('logo.size', parseInt(e.target.value) || 50)}
                          min="20"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium text-gray-800">Text</h4>
                    <button
                      onClick={() => handleOptionChange('text.enabled', !qrOptions.text.enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        qrOptions.text.enabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          qrOptions.text.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {qrOptions.text.enabled && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Text Content
                        </label>
                        <input
                          type="text"
                          value={qrOptions.text.content}
                          onChange={(e) => handleOptionChange('text.content', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Position
                          </label>
                          <select
                            value={qrOptions.text.position}
                            onChange={(e) => handleOptionChange('text.position', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="top">Top</option>
                            <option value="bottom">Bottom</option>
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Font Size (px)
                          </label>
                          <input
                            type="number"
                            value={qrOptions.text.fontSize}
                            onChange={(e) => handleOptionChange('text.fontSize', parseInt(e.target.value) || 14)}
                            min="8"
                            max="32"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* QR Code Preview */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <EyeIcon className="w-5 h-5 mr-2" />
                Preview
              </h3>
              
              <div className="space-y-6">
                {/* QR Code Display */}
                <div className="flex justify-center">
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    {loading ? (
                      <div className="flex items-center justify-center w-64 h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="max-w-full h-auto"
                        style={{ maxWidth: `${qrOptions.size}px` }}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-64 h-64 text-gray-400">
                        <QrCodeIcon className="w-16 h-16" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={downloadQRCode}
                    disabled={!qrCodeUrl || loading}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    <span>Download QR Code</span>
                  </button>
                  
                  <button
                    onClick={copyQRCode}
                    disabled={!qrCodeUrl || loading}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {copied ? <CheckIcon className="w-5 h-5" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
                    <span>{copied ? 'Copied!' : 'Copy QR Code'}</span>
                  </button>
                </div>

                {/* QR Code Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">QR Code Information</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Survey:</strong> {survey?.title}</p>
                    <p><strong>Size:</strong> {qrOptions.size}px × {qrOptions.size}px</p>
                    <p><strong>Format:</strong> {qrOptions.format.toUpperCase()}</p>
                    <p><strong>Error Correction:</strong> {getErrorCorrectionLevels().find(l => l.value === qrOptions.errorCorrectionLevel)?.label}</p>
                    <p><strong>URL:</strong> {window.location.origin}/survey/{survey?.id}</p>
                  </div>
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

export default QRCodeGenerator;

