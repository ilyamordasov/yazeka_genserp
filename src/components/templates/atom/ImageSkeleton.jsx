import React from 'react';

const skeletonStyle = {
  height: 200,
  backgroundColor: '#f0f0f0',
  borderRadius: 20,
  position: 'relative',
  overflow: 'hidden',
  flexShrink: 0,
};

const shimmerStyle = {
  position: 'absolute',
  top: 0,
  left: '-100%',
  width: '100%',
  height: '100%',
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
  animation: 'shimmer 1.5s infinite',
};

const singleImageStyle = {
  ...skeletonStyle,
  width: 300,
  minWidth: 300,
};

const galleryItemStyle = {
  ...skeletonStyle,
  width: 200,
  minWidth: 200,
};

const galleryContainerStyle = {
  display: 'flex',
  flexDirection: 'row',
  gap: 4,
  height: 200,
  width: '100%',
  overflowX: 'auto',
  overflowY: 'hidden',
  alignItems: 'flex-start',
};

const ImageSkeleton = ({ count = 1, imageDimensions = [] }) => {
  
  const skeletons = Array.from({ length: count }, (_, i) => {
    let calculatedWidth = 200; // default width
    
    // Calculate actual width based on image dimensions
    if (imageDimensions && imageDimensions[i]) {
      const { width, height } = imageDimensions[i];
      const isHorizontal = width > height;
      const aspectRatio = width / height;
      
      if (count === 1) {
        // Single image calculation
        calculatedWidth = isHorizontal ? Math.min(350, width * (300 / height)) : 300;
      } else {
        // Gallery calculation - match ImageGallery exactly
        calculatedWidth = isHorizontal ? Math.min(350, 200 * aspectRatio) : 200 / aspectRatio;
      }
    }
    
    // Create completely new style object to avoid inheritance issues
    const skeletonStyle = {
      height: 200,
      backgroundColor: '#f0f0f0',
      borderRadius: 20,
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
      width: Math.floor(calculatedWidth),
      minWidth: Math.floor(calculatedWidth),
    };
    
    return (
      <div key={i} style={skeletonStyle}>
        <div style={shimmerStyle} />
      </div>
    );
  });

  if (count === 1) {
    return skeletons[0];
  }

  return (
    <div style={galleryContainerStyle}>
      {skeletons}
    </div>
  );
};

// Add CSS animation for shimmer effect
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
`;
document.head.appendChild(style);

export default ImageSkeleton;