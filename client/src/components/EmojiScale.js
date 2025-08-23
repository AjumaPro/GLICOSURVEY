import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CustomEmojiScale from './CustomEmojiScale';
import RecommendationScaleSVG from './RecommendationScaleSVG';

const EmojiScale = ({ 
  options = [], 
  value, 
  onChange, 
  disabled = false,
  layout = 'horizontal',
  size = 'medium'
}) => {
  const [hoveredOption, setHoveredOption] = useState(null);

  const sizeClasses = {
    small: 'w-16 h-16 text-lg',
    medium: 'w-20 h-20 text-xl',
    large: 'w-24 h-24 text-2xl'
  };

  // Updated emoji color logic with only 3 colors
  const getEmojiColor = (option) => {
    const value = option.value;
    const totalOptions = options.length;

    if (totalOptions === 10) {
      if (value <= 3) return 'text-red-600';
      if (value <= 6) return 'text-yellow-500';
      return 'text-green-600';
    } else {
      if (value <= 2) return 'text-red-600';
      if (value === 3) return 'text-yellow-500';
      return 'text-green-600';
    }
  };

  const containerClasses = {
    horizontal: 'flex items-center justify-center space-x-2',
    vertical: 'flex flex-col items-center space-y-2'
  };

  const handleOptionClick = (optionValue) => {
    if (!disabled && onChange) {
      onChange(optionValue);
    }
  };

  const handleKeyPress = (event, optionValue) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOptionClick(optionValue);
    }
  };

  // Determine if this should use custom SVG emojis or regular emojis
  const shouldUseCustomEmojis = (options) => {
    // Use custom emojis for ALL 5-option scales (satisfaction, agreement, quality, ease, recommendation, etc.)
    if (options.length === 5) {
      return true;
    }
    
    // Only use regular emojis for thumbs, stars, hearts, and other specific emoji types
    const regularEmojiTypes = ['👍', '👎', '⭐', '❤️', '😀', '😍', '😊', '😐', '😞', '😢'];
    const hasRegularEmojis = options.some(opt => regularEmojiTypes.includes(opt.emoji));
    
    return !hasRegularEmojis;
  };

  // Check if this is a 10-option recommendation scale
  const isRecommendationScale = (options) => {
    return options.length === 10 && options.every(opt => typeof opt.value === 'number' && opt.value >= 1 && opt.value <= 10);
  };

  if (isRecommendationScale(options)) {
    // Use the new SVG recommendation scale for 10-option scales
    return (
      <RecommendationScaleSVG
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    );
  }

  if (shouldUseCustomEmojis(options)) {
    // Use the new custom emoji scale component for satisfaction-type scales
    return (
      <CustomEmojiScale
        options={options}
        value={value}
        onChange={onChange}
        disabled={disabled}
        layout={layout}
        size={size}
      />
    );
  }

  // Use the original emoji scale for thumbs, stars, and other non-satisfaction scales
  return (
    <div className={`emoji-scale ${containerClasses[layout]}`}>
      {options.map((option, index) => {
        const isSelected = value === option.value;
        const isHovered = hoveredOption === option.value;
        
        return (
          <motion.div
            key={option.value}
            className={`emoji-option relative ${isSelected ? 'selected' : ''} ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            onClick={() => handleOptionClick(option.value)}
            onMouseEnter={() => setHoveredOption(option.value)}
            onMouseLeave={() => setHoveredOption(null)}
            onKeyPress={(e) => handleKeyPress(e, option.value)}
            tabIndex={disabled ? -1 : 0}
            role="button"
            aria-label={`Rate ${option.label}`}
            aria-pressed={isSelected}
            whileHover={!disabled ? { scale: 1.1 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            {/* Custom image or emoji */}
            {option.image ? (
              <img
                src={option.image}
                alt={option.label}
                className={`${sizeClasses[size]} object-contain mb-2 transition-all duration-200 ${
                  isSelected ? 'scale-125' : isHovered ? 'scale-110' : 'scale-100'
                } ${getEmojiColor(option)}`}
              />
            ) : (
              <div
                className={`${sizeClasses[size]} flex items-center justify-center mb-2 transition-all duration-200 ${
                  isSelected ? 'scale-125' : isHovered ? 'scale-110' : 'scale-100'
                }`}
                style={{
                  filter: isSelected
                    ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                    : isHovered
                    ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                    : 'none'
                }}
              >
                <span className={`emoji-text ${getEmojiColor(option)}`}>
                  {option.emoji}
                </span>
              </div>
            )}
            
            {/* Label */}
            <span
              className={`text-xs text-center font-bold transition-colors duration-200 ${
                isSelected ? 'text-gray-900' : 'text-gray-600'
              }`}
            >
              {option.label}
            </span>
            
            {/* Selection indicator */}
            {isSelected && (
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                ✓
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default EmojiScale;

// Updated emoji scale templates using custom emojis
export const emojiScaleTemplates = {
  satisfaction: [
    { value: 1, label: 'Very Unsatisfied' },
    { value: 2, label: 'Unsatisfied' },
    { value: 3, label: 'Neutral' },
    { value: 4, label: 'Satisfied' },
    { value: 5, label: 'Very Satisfied' }
  ],
  agreement: [
    { value: 1, label: 'Strongly Disagree' },
    { value: 2, label: 'Disagree' },
    { value: 3, label: 'Neutral' },
    { value: 4, label: 'Agree' },
    { value: 5, label: 'Strongly Agree' }
  ],
  quality: [
    { value: 1, label: 'Poor' },
    { value: 2, label: 'Fair' },
    { value: 3, label: 'Good' },
    { value: 4, label: 'Very Good' },
    { value: 5, label: 'Excellent' }
  ],
  thumbs: [
    { value: 1, label: 'Thumbs Down', emoji: '👎' },
    { value: 2, label: 'Thumbs Up', emoji: '👍' }
  ],
  recommendation_5: [
    { value: 1, label: 'Very Unlikely' },
    { value: 2, label: 'Unlikely' },
    { value: 3, label: 'Neutral' },
    { value: 4, label: 'Likely' },
    { value: 5, label: 'Very Likely' }
  ],
  recommendation_10: [
    { value: 1, label: 'Unlikely' },
    { value: 2, label: 'Unlikely' },
    { value: 3, label: 'Unlikely' },
    { value: 4, label: 'Unlikely' },
    { value: 5, label: 'Unlikely' },
    { value: 6, label: 'Unlikely' },
    { value: 7, label: 'Neutral' },
    { value: 8, label: 'Neutral' },
    { value: 9, label: 'Likely' },
    { value: 10, label: 'Likely' }
  ],
  ease_of_interaction: [
    { value: 1, label: 'Very Difficult' },
    { value: 2, label: 'Difficult' },
    { value: 3, label: 'Moderate' },
    { value: 4, label: 'Easy' },
    { value: 5, label: 'Very Easy' }
  ],
  customer_satisfaction: [
    { value: 1, label: 'Very Dissatisfied' },
    { value: 2, label: 'Dissatisfied' },
    { value: 3, label: 'Neutral' },
    { value: 4, label: 'Satisfied' },
    { value: 5, label: 'Very Satisfied' }
  ],
  service_quality: [
    { value: 1, label: 'Poor' },
    { value: 2, label: 'Below Average' },
    { value: 3, label: 'Average' },
    { value: 4, label: 'Good' },
    { value: 5, label: 'Excellent' }
  ],
  stars: [
    { value: 1, label: '1 Star', emoji: '⭐' },
    { value: 2, label: '2 Stars', emoji: '⭐⭐' },
    { value: 3, label: '3 Stars', emoji: '⭐⭐⭐' },
    { value: 4, label: '4 Stars', emoji: '⭐⭐⭐⭐' },
    { value: 5, label: '5 Stars', emoji: '⭐⭐⭐⭐⭐' }
  ],
  hearts: [
    { value: 1, label: '1 Heart', emoji: '❤️' },
    { value: 2, label: '2 Hearts', emoji: '❤️❤️' },
    { value: 3, label: '3 Hearts', emoji: '❤️❤️❤️' },
    { value: 4, label: '4 Hearts', emoji: '❤️❤️❤️❤️' },
    { value: 5, label: '5 Hearts', emoji: '❤️❤️❤️❤️❤️' }
  ]
};
