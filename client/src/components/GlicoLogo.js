import React from 'react';

const GlicoLogo = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'h-16',
    medium: 'h-20',
    large: 'h-24'
  };

  const logoSrc = '/Glico_logo.png';
  
  console.log('GlicoLogo rendering with src:', logoSrc, 'size:', size);

  return (
    <div 
      className={`flex items-center justify-center ${sizeClasses[size]} ${className}`} 
      style={{ 
        minHeight: sizeClasses[size], 
        //backgroundColor: 'white',

       // padding: '8px',
       // borderRadius: '8px',
       // boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
    >
      <img 
        src={logoSrc} 
        alt="GLICO LIFE" 
        className="h-full w-auto object-contain"
        style={{ maxHeight: '100%', maxWidth: '100%' }}
        onLoad={() => console.log('Logo loaded successfully:', logoSrc)}
        onError={(e) => {
          console.error('Failed to load logo:', e.target.src);
          // Fallback to a text-based logo if image fails
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'block';
        }}
      />
      {/* Fallback text logo */}
      <div className="hidden text-red-500 font-bold text-lg">
        GLICO LIFE
      </div>
    </div>
  );
};

export default GlicoLogo; 