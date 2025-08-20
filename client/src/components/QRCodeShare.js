import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Copy, Download, Share2, X, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

const QRCodeShare = ({ surveyUrl, surveyTitle, shortUrl, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [copiedShort, setCopiedShort] = useState(false);

  const copyToClipboard = async (text, type = 'URL') => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        // Modern clipboard API
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      if (type === 'short') {
        setCopiedShort(true);
        toast.success('Short URL copied to clipboard!');
        setTimeout(() => setCopiedShort(false), 2000);
      } else {
        setCopied(true);
        toast.success('URL copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy URL. Please try selecting and copying manually.');
    }
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const pngFile = canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${surveyTitle}-QR-Code.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const shareSurvey = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: surveyTitle,
          text: `Take this survey: ${surveyTitle}`,
          url: surveyUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      copyToClipboard(surveyUrl);
    }
  };

  const openSurvey = () => {
    window.open(surveyUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Share Survey</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="text-center mb-6">
          <h4 className="font-medium text-gray-900 mb-2">{surveyTitle}</h4>
          <p className="text-sm text-gray-600 mb-4">Scan the QR code to access the survey</p>
          
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
            <QRCode
              id="qr-code-svg"
              value={surveyUrl}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* Full URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full URL</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={surveyUrl}
                readOnly
                className="flex-1 p-2 border border-gray-300 rounded text-sm bg-gray-50"
              />
              <button
                onClick={() => copyToClipboard(surveyUrl)}
                className={`px-3 py-2 rounded transition-colors ${
                  copied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Short URL */}
          {shortUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Short URL</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shortUrl}
                  readOnly
                  className="flex-1 p-2 border border-gray-300 rounded text-sm bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(shortUrl, 'short')}
                  className={`px-3 py-2 rounded transition-colors ${
                    copiedShort 
                      ? 'bg-green-600 text-white' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={downloadQRCode}
              className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download QR
            </button>
            <button
              onClick={shareSurvey}
              className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </button>
          </div>

          {/* Open Survey Button */}
          <button
            onClick={openSurvey}
            className="w-full flex items-center justify-center p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Survey
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500 text-center space-y-1">
          <p>• QR code works on mobile devices</p>
          <p>• Survey must be published to be accessible</p>
          <p>• Short URL is easier to share</p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeShare; 