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
  console.log("🦴 ImageSkeleton received:", { count, imageDimensions });
  
  const skeletons = Array.from({ length: count }, (_, i) => {
    let style = count === 1 ? singleImageStyle : galleryItemStyle;
    
    // If we have dimension information, use it to size the skeleton exactly like the real images
    if (imageDimensions && imageDimensions[i]) {
      const { width, height } = imageDimensions[i];
      const isHorizontal = width > height;
      const aspectRatio = width / height;
      
      console.log(`🦴 Skeleton ${i}: ${width}x${height}, isHorizontal: ${isHorizontal}, aspectRatio: ${aspectRatio}`);
      
      if (count === 1) {
        // Single image: match OneImage component exactly
        const maxWidth = isHorizontal ? '350px' : '100%';
        style = {
          ...singleImageStyle,
          maxWidth: maxWidth,
          width: 'auto',
          minWidth: 'auto',
          height: 'auto',
          aspectRatio: `${width} / ${height}`,
        };
      } else {
        // Gallery: match ImageGallery component exactly
        const maxWidth = isHorizontal ? Math.min(350, 200 * aspectRatio) : 200 / aspectRatio;
        style = {
          ...galleryItemStyle,
          width: maxWidth,
          minWidth: maxWidth,
          maxWidth: isHorizontal ? '350px' : 'auto'
        };
      }
    }
    
    return (
      <div key={i} style={style}>
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