import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CustomEmojiScale = ({ 
  options = [], 
  value, 
  onChange, 
  disabled = false,
  layout = 'horizontal',
  size = 'medium'
}) => {
  const [hoveredOption, setHoveredOption] = useState(null);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-20 h-20',
    large: 'w-24 h-24'
  };

  const containerClasses = {
    horizontal: 'flex items-center justify-center space-x-4',
    vertical: 'flex flex-col items-center space-y-4'
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

  // Custom SVG emojis based on the image description
  const getEmojiSVG = (option) => {
    const { value: optionValue, label } = option;
    const isSelected = value === optionValue;
    const isHovered = hoveredOption === optionValue;
    
    // Color mapping based on satisfaction level
    const getEmojiColor = (val) => {
      switch (val) {
        case 1: return '#FF6B35'; // Orange for Very Unsatisfied/Very Unlikely
        case 2: return '#FF4444'; // Red for Unsatisfied/Unlikely
        case 3: return '#FFD93D'; // Yellow for Neutral
        case 4: return '#4CAF50'; // Green for Satisfied/Likely
        case 5: return '#2E7D32'; // Dark Green for Very Satisfied/Very Likely
        default: return '#FFD93D';
      }
    };

    const baseColor = getEmojiColor(optionValue);
    const selectedColor = isSelected ? '#1F2937' : baseColor;
    const hoverColor = isHovered ? '#374151' : selectedColor;

    switch (optionValue) {
      case 1: // Very Unsatisfied
        return (
          <svg viewBox="0 0 100 100" className={`${sizeClasses[size]} transition-all duration-200`}>
            <circle cx="50" cy="50" r="45" fill={hoverColor} stroke="#1F2937" strokeWidth="2"/>
            {/* Angry eyebrows */}
            <path d="M25 35 Q35 25 45 35" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <path d="M55 35 Q65 25 75 35" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round"/>
            {/* Deep frown */}
            <path d="M30 60 Q50 75 70 60" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round"/>
          </svg>
        );
      
      case 2: // Unsatisfied
        return (
          <svg viewBox="0 0 100 100" className={`${sizeClasses[size]} transition-all duration-200`}>
            <circle cx="50" cy="50" r="45" fill={hoverColor} stroke="#1F2937" strokeWidth="2"/>
            {/* Simple eyes */}
            <circle cx="35" cy="40" r="3" fill="#1F2937"/>
            <circle cx="65" cy="40" r="3" fill="#1F2937"/>
            {/* Downward curve */}
            <path d="M30 60 Q50 70 70 60" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round"/>
          </svg>
        );
      
      case 3: // Neutral
        return (
          <svg viewBox="0 0 100 100" className={`${sizeClasses[size]} transition-all duration-200`}>
            <circle cx="50" cy="50" r="45" fill={hoverColor} stroke="#1F2937" strokeWidth="2"/>
            {/* Simple eyes */}
            <circle cx="35" cy="40" r="3" fill="#1F2937"/>
            <circle cx="65" cy="40" r="3" fill="#1F2937"/>
            {/* Straight line */}
            <line x1="30" y1="60" x2="70" y2="60" stroke="#1F2937" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        );
      
      case 4: // Satisfied
        return (
          <svg viewBox="0 0 100 100" className={`${sizeClasses[size]} transition-all duration-200`}>
            <circle cx="50" cy="50" r="45" fill={hoverColor} stroke="#1F2937" strokeWidth="2"/>
            {/* Simple eyes */}
            <circle cx="35" cy="40" r="3" fill="#1F2937"/>
            <circle cx="65" cy="40" r="3" fill="#1F2937"/>
            {/* Gentle smile */}
            <path d="M30 60 Q50 70 70 60" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round"/>
          </svg>
        );
      
      case 5: // Very Satisfied
        return (
          <svg viewBox="0 0 100 100" className={`${sizeClasses[size]} transition-all duration-200`}>
            <circle cx="50" cy="50" r="45" fill={hoverColor} stroke="#1F2937" strokeWidth="2"/>
            {/* Heart-shaped eyes */}
            <path d="M30 35 Q35 30 40 35 Q35 40 30 35" fill="#1F2937"/>
            <path d="M60 35 Q65 30 70 35 Q65 40 60 35" fill="#1F2937"/>
            {/* Wide happy smile */}
            <path d="M25 55 Q50 75 75 55" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round"/>
          </svg>
        );
      
      default:
        return (
          <svg viewBox="0 0 100 100" className={`${sizeClasses[size]} transition-all duration-200`}>
            <circle cx="50" cy="50" r="45" fill={hoverColor} stroke="#1F2937" strokeWidth="2"/>
            <circle cx="35" cy="40" r="3" fill="#1F2937"/>
            <circle cx="65" cy="40" r="3" fill="#1F2937"/>
            <line x1="30" y1="60" x2="70" y2="60" stroke="#1F2937" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        );
    }
  };

  return (
    <div className={`custom-emoji-scale ${containerClasses[layout]}`}>
      {options.map((option, index) => {
        const isSelected = value === option.value;
        
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
            {/* Custom SVG Emoji */}
            <div className="emoji-container">
              {getEmojiSVG(option)}
            </div>
            
            {/* Label */}
            <div className="mt-2 text-center">
              <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                {option.label}
              </span>
            </div>

            {/* Selection indicator */}
            {isSelected && (
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default CustomEmojiScale;

// Updated emoji scale templates with the new custom emojis
export const customEmojiScaleTemplates = {
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
  ease_of_use: [
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
  ]
}; 