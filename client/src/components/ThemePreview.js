import React, { useState, useEffect } from 'react';
import {
  Eye,
  Download,
  Share2,
  Heart,
  Star,
  Copy,
  ExternalLink,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import toast from 'react-hot-toast';

const ThemePreview = ({ theme, onClose, isModal = false }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [rating, setRating] = useState(theme?.rating || 0);

  const generatePreviewHTML = () => {
    if (!theme) return '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${theme.name} - Survey Preview</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: ${theme.typography.fontFamily};
            background: #f8fafc;
            min-height: 100vh;
            padding: 2rem 1rem;
        }
        
        .survey-container {
            max-width: ${theme.layout.maxWidth};
            margin: 0 auto;
            background: ${theme.colors.background};
            border-radius: ${theme.layout.borderRadius};
            box-shadow: ${theme.layout.shadow};
            overflow: hidden;
        }
        
        .survey-header {
            background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%);
            color: white;
            padding: 2rem;
            text-align: center;
            position: relative;
        }
        
        .survey-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        
        .survey-title {
            font-size: ${theme.typography.headingSize};
            font-weight: 700;
            margin: 0 0 0.5rem 0;
            position: relative;
            z-index: 1;
        }
        
        .survey-description {
            font-size: 1.1rem;
            opacity: 0.9;
            margin: 0;
            position: relative;
            z-index: 1;
        }
        
        .survey-progress {
            background: rgba(255, 255, 255, 0.2);
            height: 4px;
            border-radius: 2px;
            overflow: hidden;
            margin: 1.5rem 0 0 0;
            position: relative;
            z-index: 1;
        }
        
        .survey-progress-bar {
            background: white;
            height: 100%;
            border-radius: 2px;
            width: 33%;
            transition: width 0.3s ease;
        }
        
        .survey-form {
            padding: 2rem;
        }
        
        .question {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: ${theme.colors.background};
            border: 1px solid ${theme.colors.border};
            border-radius: ${theme.components.cardRadius};
            transition: all ${theme.components.animationSpeed} ease;
        }
        
        .question:hover {
            border-color: ${theme.colors.primary};
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .question-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0 0 1rem 0;
            color: ${theme.colors.text};
        }
        
        .question-title.required::after {
            content: ' *';
            color: ${theme.colors.error};
        }
        
        .input, .textarea, .select {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 2px solid ${theme.colors.border};
            border-radius: ${theme.components.inputRadius};
            font-size: ${theme.typography.bodySize};
            transition: all ${theme.components.animationSpeed} ease;
            background: ${theme.colors.background};
            color: ${theme.colors.text};
        }
        
        .input:focus, .textarea:focus, .select:focus {
            outline: none;
            border-color: ${theme.colors.primary};
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .textarea {
            min-height: 120px;
            resize: vertical;
        }
        
        .radio-group, .checkbox-group {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        
        .radio-item, .checkbox-item {
            display: flex;
            align-items: center;
            padding: 0.75rem;
            border: 2px solid ${theme.colors.border};
            border-radius: ${theme.components.inputRadius};
            cursor: pointer;
            transition: all ${theme.components.animationSpeed} ease;
            background: ${theme.colors.background};
        }
        
        .radio-item:hover, .checkbox-item:hover {
            border-color: ${theme.colors.primary};
            background: rgba(59, 130, 246, 0.05);
        }
        
        .radio-item input[type="radio"], .checkbox-item input[type="checkbox"] {
            margin-right: 0.75rem;
            width: 1.25rem;
            height: 1.25rem;
            accent-color: ${theme.colors.primary};
        }
        
        .emoji-scale {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            margin: 1.5rem 0;
            flex-wrap: wrap;
        }
        
        .emoji-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            padding: 1rem;
            border-radius: ${theme.components.inputRadius};
            transition: all ${theme.components.animationSpeed} ease;
            min-width: 100px;
        }
        
        .emoji-item:hover {
            background: rgba(59, 130, 246, 0.1);
            transform: scale(1.05);
        }
        
        .emoji {
            font-size: 3rem;
            margin-bottom: 0.5rem;
        }
        
        .emoji-label {
            font-size: 0.9rem;
            font-weight: 500;
            text-align: center;
        }
        
        .button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: ${theme.components.buttonRadius};
            font-size: ${theme.typography.bodySize};
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: all ${theme.components.animationSpeed} ease;
            min-height: 44px;
        }
        
        .button-primary {
            background: ${theme.colors.primary};
            color: white;
        }
        
        .button-primary:hover {
            background: ${theme.colors.accent};
            transform: translateY(-1px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        
        .button-secondary {
            background: ${theme.colors.background};
            color: ${theme.colors.text};
            border: 2px solid ${theme.colors.border};
        }
        
        .button-secondary:hover {
            border-color: ${theme.colors.primary};
            color: ${theme.colors.primary};
        }
        
        .survey-navigation {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2rem;
            background: #f8fafc;
            border-top: 1px solid ${theme.colors.border};
        }
        
        .survey-navigation .button {
            min-width: 120px;
        }
        
        @media (max-width: 768px) {
            body {
                padding: 1rem 0.5rem;
            }
            
            .survey-header {
                padding: 1.5rem 1rem;
            }
            
            .survey-title {
                font-size: 1.5rem;
            }
            
            .survey-form {
                padding: 1rem;
            }
            
            .question {
                padding: 1rem;
                margin-bottom: 1.5rem;
            }
            
            .emoji-scale {
                gap: 1rem;
            }
            
            .emoji-item {
                min-width: 80px;
                padding: 0.75rem;
            }
            
            .emoji {
                font-size: 2.5rem;
            }
            
            .survey-navigation {
                flex-direction: column;
                gap: 1rem;
                padding: 1rem;
            }
            
            .survey-navigation .button {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="survey-container">
        <div class="survey-header">
            <h1 class="survey-title">Customer Satisfaction Survey</h1>
            <p class="survey-description">Help us improve our services by sharing your feedback</p>
            <div class="survey-progress">
                <div class="survey-progress-bar"></div>
            </div>
        </div>
        
        <form class="survey-form">
            <div class="question">
                <h3 class="question-title required">What is your name?</h3>
                <input type="text" class="input" placeholder="Enter your name">
            </div>
            
            <div class="question">
                <h3 class="question-title required">How satisfied are you with our service?</h3>
                <div class="radio-group">
                    <label class="radio-item">
                        <input type="radio" name="satisfaction" value="very-satisfied">
                        <span>Very Satisfied</span>
                    </label>
                    <label class="radio-item">
                        <input type="radio" name="satisfaction" value="satisfied">
                        <span>Satisfied</span>
                    </label>
                    <label class="radio-item">
                        <input type="radio" name="satisfaction" value="neutral">
                        <span>Neutral</span>
                    </label>
                    <label class="radio-item">
                        <input type="radio" name="satisfaction" value="dissatisfied">
                        <span>Dissatisfied</span>
                    </label>
                </div>
            </div>
            
            <div class="question">
                <h3 class="question-title required">How do you feel about our product?</h3>
                <div class="emoji-scale">
                    <div class="emoji-item">
                        <div class="emoji">😢</div>
                        <div class="emoji-label">Very Sad</div>
                    </div>
                    <div class="emoji-item">
                        <div class="emoji">😞</div>
                        <div class="emoji-label">Sad</div>
                    </div>
                    <div class="emoji-item">
                        <div class="emoji">😐</div>
                        <div class="emoji-label">Neutral</div>
                    </div>
                    <div class="emoji-item">
                        <div class="emoji">😊</div>
                        <div class="emoji-label">Happy</div>
                    </div>
                    <div class="emoji-item">
                        <div class="emoji">😄</div>
                        <div class="emoji-label">Very Happy</div>
                    </div>
                </div>
            </div>
            
            <div class="question">
                <h3 class="question-title">Any additional comments?</h3>
                <textarea class="textarea" placeholder="Share your thoughts..."></textarea>
            </div>
            
            <div class="survey-navigation">
                <button type="button" class="button button-secondary">Previous</button>
                <div class="survey-progress-text">
                    <span>3</span> / <span>4</span>
                </div>
                <button type="submit" class="button button-primary">Submit Survey</button>
            </div>
        </form>
    </div>
</body>
</html>
    `;
  };

  const handleDownload = () => {
    const html = generatePreviewHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name.replace(/\s+/g, '-').toLowerCase()}-preview.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Preview downloaded successfully');
  };

  const handleShare = () => {
    const url = `${window.location.origin}/themes/${theme.id}/preview`;
    navigator.clipboard.writeText(url);
    toast.success('Preview link copied to clipboard');
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleRating = (newRating) => {
    setRating(newRating);
    toast.success(`Rated ${newRating} stars`);
  };

  const handleCopyCSS = () => {
    // This would generate the actual CSS from the theme
    const css = `/* ${theme.name} Theme CSS */\n:root {\n  --primary: ${theme.colors.primary};\n  --secondary: ${theme.colors.secondary};\n  /* ... more CSS variables */\n}`;
    navigator.clipboard.writeText(css);
    toast.success('CSS copied to clipboard');
  };

  if (!theme) return null;

  return (
    <div className={`${isModal ? 'fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4' : ''}`}>
      <div className={`bg-white rounded-lg shadow-xl ${isModal ? 'max-w-6xl w-full max-h-[90vh] overflow-hidden' : 'w-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div
              className="w-12 h-12 rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`
              }}
            ></div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{theme.name}</h2>
              <p className="text-sm text-gray-600">{theme.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
            {isModal && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLike}
                  className={`p-2 rounded-md transition-colors ${
                    isLiked 
                      ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <span className="text-sm text-gray-600">{theme.usageCount || 0}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className={`p-1 transition-colors ${
                      star <= rating 
                        ? 'text-yellow-400 hover:text-yellow-500' 
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    <Star className={`h-4 w-4 ${star <= rating ? 'fill-current' : ''}`} />
                  </button>
                ))}
                <span className="text-sm text-gray-600 ml-2">{rating.toFixed(1)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyCSS}
                className="btn-secondary"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy CSS
              </button>
              <button
                onClick={handleShare}
                className="btn-secondary"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
              <button
                onClick={handleDownload}
                className="btn-primary"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className={`${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'} overflow-hidden`}>
          <iframe
            srcDoc={generatePreviewHTML()}
            className="w-full h-full border-0"
            title={`${theme.name} Preview`}
          />
        </div>

        {/* Theme Info */}
        <div className="p-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Color Palette</h4>
              <div className="flex space-x-2">
                {Object.entries(theme.colors).slice(0, 5).map(([key, value]) => (
                  <div
                    key={key}
                    className="w-8 h-8 rounded border border-gray-200"
                    style={{ backgroundColor: value }}
                    title={`${key}: ${value}`}
                  ></div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Typography</h4>
              <div className="text-sm text-gray-600">
                <div>Font: {theme.typography.fontFamily}</div>
                <div>Heading: {theme.typography.headingSize}</div>
                <div>Body: {theme.typography.bodySize}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Layout</h4>
              <div className="text-sm text-gray-600">
                <div>Max Width: {theme.layout.maxWidth}</div>
                <div>Padding: {theme.layout.padding}</div>
                <div>Border Radius: {theme.layout.borderRadius}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemePreview;
