import React, { useState } from 'react';
import { motion } from 'framer-motion';

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

  // Professional color scheme based on value ranges
  const getColorScheme = (value, totalOptions) => {
    if (totalOptions === 10) {
      // 10-point scale: red (1-6) -> yellow (7-8) -> green (9-10)
      if (value <= 6) return 'text-red-500 bg-red-50 border-red-200';
      if (value <= 8) return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      return 'text-green-500 bg-green-50 border-green-200';
    } else {
      // 5-point scale: red -> yellow -> green
      if (value <= 2) return 'text-red-500 bg-red-50 border-red-200';
      if (value === 3) return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      return 'text-green-500 bg-green-50 border-green-200';
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

  return (
    <div className={`emoji-scale ${containerClasses[layout]}`}>
      {options.map((option, index) => {
        const isSelected = value === option.value;
        const isHovered = hoveredOption === option.value;
        
        return (
          <motion.div
            key={option.value}
            className={`emoji-option ${isSelected ? 'selected' : ''} ${
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
            whileHover={!disabled ? { scale: 1.05 } : {}}
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
                className={`${sizeClasses[size]} object-contain mb-2 transition-all duration-200 rounded-full border-2 ${
                  isSelected ? 'scale-110 border-primary-500 shadow-lg' : isHovered ? 'scale-105 border-gray-300' : 'border-gray-200'
                } ${getColorScheme(option.value, options.length)}`}
              />
            ) : (
              <div
                className={`${sizeClasses[size]} flex items-center justify-center mb-2 transition-all duration-200 rounded-full border-2 ${
                  isSelected ? 'scale-110 border-primary-500 shadow-lg' : isHovered ? 'scale-105 border-gray-300' : 'border-gray-200'
                } ${getColorScheme(option.value, options.length)}`}
              >
                {option.emoji}
              </div>
            )}
            
            {/* Label */}
            <span className={`text-xs text-center font-medium transition-colors duration-200 ${
              isSelected ? 'text-primary-700 font-semibold' : 'text-gray-600'
            }`}>
              {option.label}
            </span>
            
            {/* Value indicator */}
            {isSelected && (
              <motion.div
                className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
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

// EmojiScale Builder Component for creating custom scales
export const EmojiScaleBuilder = ({ 
  options = [], 
  onChange, 
  onAddOption, 
  onRemoveOption 
}) => {
  const [newOption, setNewOption] = useState({ value: '', label: '', emoji: '' });

  const handleAddOption = () => {
    if (newOption.value && newOption.label && newOption.emoji) {
      onAddOption(newOption);
      setNewOption({ value: '', label: '', emoji: '' });
    }
  };

  const handleRemoveOption = (index) => {
    onRemoveOption(index);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Emoji Scale Options</h3>
      
      {/* Existing options */}
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
            <span className="text-2xl">{option.emoji}</span>
            <input
              type="number"
              value={option.value}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index].value = parseInt(e.target.value);
                onChange(newOptions);
              }}
              className="w-16 input"
              placeholder="Value"
            />
            <input
              type="text"
              value={option.label}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index].label = e.target.value;
                onChange(newOptions);
              }}
              className="flex-1 input"
              placeholder="Label"
            />
            <button
              onClick={() => handleRemoveOption(index)}
              className="btn-error px-2 py-1 text-xs"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      
      {/* Add new option */}
      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
        <input
          type="text"
          value={newOption.emoji}
          onChange={(e) => setNewOption({ ...newOption, emoji: e.target.value })}
          className="w-16 input"
          placeholder="😊"
        />
        <input
          type="number"
          value={newOption.value}
          onChange={(e) => setNewOption({ ...newOption, value: parseInt(e.target.value) })}
          className="w-16 input"
          placeholder="Value"
        />
        <input
          type="text"
          value={newOption.label}
          onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
          className="flex-1 input"
          placeholder="Label"
        />
        <button
          onClick={handleAddOption}
          className="btn-success px-2 py-1 text-xs"
        >
          Add
        </button>
      </div>
    </div>
  );
};

// Predefined emoji scale templates
export const emojiScaleTemplates = {
  satisfaction: [
    { value: 1, label: 'Very Dissatisfied', emoji: '😞' },
    { value: 2, label: 'Dissatisfied', emoji: '😐' },
    { value: 3, label: 'Neutral', emoji: '😐' },
    { value: 4, label: 'Satisfied', emoji: '🙂' },
    { value: 5, label: 'Very Satisfied', emoji: '😊' }
  ],
  agreement: [
    { value: 1, label: 'Strongly Disagree', emoji: '👎' },
    { value: 2, label: 'Disagree', emoji: '👎' },
    { value: 3, label: 'Neutral', emoji: '🤷' },
    { value: 4, label: 'Agree', emoji: '👍' },
    { value: 5, label: 'Strongly Agree', emoji: '👍' }
  ],
  quality: [
    { value: 1, label: 'Poor', emoji: '⭐' },
    { value: 2, label: 'Fair', emoji: '⭐⭐' },
    { value: 3, label: 'Good', emoji: '⭐⭐⭐' },
    { value: 4, label: 'Very Good', emoji: '⭐⭐⭐⭐' },
    { value: 5, label: 'Excellent', emoji: '⭐⭐⭐⭐⭐' }
  ],
  thumbs: [
    { value: 1, label: 'Thumbs Down', emoji: '👎' },
    { value: 2, label: 'Thumbs Up', emoji: '👍' }
  ]
};

export default EmojiScale; 