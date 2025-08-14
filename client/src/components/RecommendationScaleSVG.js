import React from 'react';

const RecommendationScaleSVG = ({ 
  value, 
  onChange, 
  disabled = false 
}) => {
  const ratingData = [
    { value: 1, color: '#e53e3e', label: 'Unlikely' },
    { value: 2, color: '#e53e3e', label: 'Unlikely' },
    { value: 3, color: '#e53e3e', label: 'Unlikely' },
    { value: 4, color: '#e53e3e', label: 'Unlikely' },
    { value: 5, color: '#e53e3e', label: 'Unlikely' },
    { value: 6, color: '#e53e3e', label: 'Unlikely' },
    { value: 7, color: '#f6ad55', label: 'Neutral' },
    { value: 8, color: '#f6ad55', label: 'Neutral' },
    { value: 9, color: '#38a169', label: 'Likely' },
    { value: 10, color: '#38a169', label: 'Likely' },
  ];

  const getEmojiSVG = (value, color) => {
    if (value <= 6) {
      // Sad face for values 1-6
      return (
        <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="15" fill={color} stroke="#fff" strokeWidth="2"/>
          <circle cx="12" cy="12" r="2" fill="#fff"/>
          <circle cx="20" cy="12" r="2" fill="#fff"/>
          <path d="M10 20 Q16 26 22 20" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    } else if (value <= 8) {
      // Neutral face for values 7-8
      return (
        <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="15" fill={color} stroke="#fff" strokeWidth="2"/>
          <circle cx="12" cy="12" r="2" fill="#fff"/>
          <circle cx="20" cy="12" r="2" fill="#fff"/>
          <line x1="10" y1="20" x2="22" y2="20" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    } else {
      // Happy face for values 9-10
      return (
        <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="15" fill={color} stroke="#fff" strokeWidth="2"/>
          <circle cx="12" cy="12" r="2" fill="#fff"/>
          <circle cx="20" cy="12" r="2" fill="#fff"/>
          <path d="M10 18 Q16 12 22 18" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    }
  };

  const handleClick = (ratingValue) => {
    if (!disabled && onChange) {
      onChange(ratingValue);
    }
  };

  return (
    <div className="rating-scale-svg">
      <div className="faces">
        {ratingData.map((item, index) => {
          const isSelected = value === item.value;
          
          return (
            <div
              key={item.value}
              className={`face-item ${isSelected ? 'selected' : ''} ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
              onClick={() => handleClick(item.value)}
              style={{
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s ease'
              }}
            >
              <div className="emoji-container">
                {getEmojiSVG(item.value, item.color)}
                {isSelected && (
                  <div
                    className="selection-indicator"
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
              <div 
                className="number" 
                style={{ color: item.color }}
              >
                {item.value}
              </div>
            </div>
          );
        })}
      </div>
      <div className="labels">
        <span className="label red">Unlikely</span>
        <span className="label orange">Neutral</span>
        <span className="label green">Likely</span>
      </div>
    </div>
  );
};

export default RecommendationScaleSVG; 