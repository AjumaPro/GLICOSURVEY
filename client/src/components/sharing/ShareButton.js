import React, { useState } from 'react';
import { 
  ShareIcon,
  LinkIcon,
  QrCodeIcon,
  CodeBracketIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import ShareModal from './ShareModal';
import EmbedCode from './EmbedCode';

const ShareButton = ({ survey, variant = 'default', size = 'md', className = '' }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const copySurveyLink = async () => {
    try {
      const surveyUrl = `${window.location.origin}/survey/${survey.id}`;
      await navigator.clipboard.writeText(surveyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'secondary':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
      case 'outline':
        return 'border border-gray-300 text-gray-700 hover:bg-gray-50';
      case 'ghost':
        return 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowShareModal(true)}
          className={`flex items-center space-x-2 ${getSizeClasses()} ${getVariantClasses()} rounded-lg transition-colors ${className}`}
        >
          <ShareIcon className={getIconSize()} />
          <span>Share</span>
        </button>

        {showShareModal && (
          <ShareModal
            survey={survey}
            onClose={() => setShowShareModal(false)}
          />
        )}

        {showEmbedModal && (
          <EmbedCode
            survey={survey}
            onClose={() => setShowEmbedModal(false)}
          />
        )}
      </div>
    );
  }

  if (variant === 'menu') {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center space-x-3 w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ShareIcon className="w-5 h-5" />
          <span>Share Survey</span>
        </button>
        
        <button
          onClick={() => setShowEmbedModal(true)}
          className="flex items-center space-x-3 w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <CodeBracketIcon className="w-5 h-5" />
          <span>Embed Code</span>
        </button>
        
        <button
          onClick={copySurveyLink}
          className="flex items-center space-x-3 w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {copied ? <CheckIcon className="w-5 h-5" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>

        {showShareModal && (
          <ShareModal
            survey={survey}
            onClose={() => setShowShareModal(false)}
          />
        )}

        {showEmbedModal && (
          <EmbedCode
            survey={survey}
            onClose={() => setShowEmbedModal(false)}
          />
        )}
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            title="Share Survey"
          >
            <ShareIcon className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => setShowEmbedModal(true)}
            className="flex items-center justify-center w-12 h-12 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors"
            title="Embed Code"
          >
            <CodeBracketIcon className="w-6 h-6" />
          </button>
        </div>

        {showShareModal && (
          <ShareModal
            survey={survey}
            onClose={() => setShowShareModal(false)}
          />
        )}

        {showEmbedModal && (
          <EmbedCode
            survey={survey}
            onClose={() => setShowEmbedModal(false)}
          />
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={copySurveyLink}
          className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
        >
          {copied ? <CheckIcon className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
        
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
        >
          <ShareIcon className="w-4 h-4" />
          <span>Share</span>
        </button>
        
        <button
          onClick={() => setShowEmbedModal(true)}
          className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
        >
          <CodeBracketIcon className="w-4 h-4" />
          <span>Embed</span>
        </button>

        {showShareModal && (
          <ShareModal
            survey={survey}
            onClose={() => setShowShareModal(false)}
          />
        )}

        {showEmbedModal && (
          <EmbedCode
            survey={survey}
            onClose={() => setShowEmbedModal(false)}
          />
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setShowShareModal(true)}
        className={`flex items-center space-x-2 ${getSizeClasses()} ${getVariantClasses()} rounded-lg transition-colors ${className}`}
      >
        <ShareIcon className={getIconSize()} />
        <span>Share Survey</span>
      </button>

      {showShareModal && (
        <ShareModal
          survey={survey}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showEmbedModal && (
        <EmbedCode
          survey={survey}
          onClose={() => setShowEmbedModal(false)}
        />
      )}
    </div>
  );
};

export default ShareButton;

