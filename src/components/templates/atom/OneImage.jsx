import React from 'react';

const OneImage = ({ imageUrl, width, height }) => {
  console.log("OneImage received:", imageUrl, `${width}x${height}`);
  
  // Calculate if image is horizontal and apply max-width
  const isHorizontal = width && height && width > height;
  const maxWidth = isHorizontal ? '350px' : '100%';
  
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%' }}>
      {imageUrl ? (
        <div style={{ position: 'relative', display: 'block', width: '100%' }}>
          <img 
            src={imageUrl} 
            alt="One" 
            style={{ 
              width: '100%',
              borderRadius: 12,
              height: 'auto',
              display: 'block'
            }} 
          />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            borderRadius: 12,
            pointerEvents: 'none'
          }} />
        </div>
      ) : (
        // fallback: show nothing or a placeholder if no imageUrl
        null
      )}
    </div>
  );
};

export default OneImage; 