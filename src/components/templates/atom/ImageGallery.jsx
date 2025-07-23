import React from 'react';
import YouTubeVideo from './YouTubeVideo';

const cardStyle = {
  background: '#fff',
  borderRadius: 20,
  height: 200,
  overflow: 'hidden',
  position: 'relative',
  display: 'inline-block',
  boxSizing: 'border-box',
  padding: 0,
  margin: 0,
  flexShrink: 0,
};

const imgStyle = {
  height: 200,
  objectFit: 'cover', // Maintain aspect ratio, crop if needed
  display: 'block',
  borderRadius: 20,
  flexShrink: 0,
};

const ImageGallery = ({ imageUrls = [], imagesWithDimensions = [], youtubeVideo = null }) => {
  console.log("🖼️ ImageGallery received:");
  console.log("  - imageUrls:", imageUrls);
  console.log("  - imageUrls.length:", imageUrls.length);
  console.log("  - imagesWithDimensions:", imagesWithDimensions);
  console.log("  - imagesWithDimensions.length:", imagesWithDimensions.length);
  console.log("  - youtubeVideo:", youtubeVideo);
  
  // Use imagesWithDimensions if available, fallback to imageUrls
  const imagesToRender = imagesWithDimensions.length > 0 ? imagesWithDimensions : imageUrls.map(url => ({ url }));
  console.log("  - imagesToRender:", imagesToRender);
  console.log("  - imagesToRender.length:", imagesToRender.length);
  
  // Create items array with YouTube video first if available
  const items = [];
  
  // Add YouTube video as first item if available
  if (youtubeVideo) {
    items.push({
      type: 'youtube',
      videoId: youtubeVideo.videoId,
      searchTerm: youtubeVideo.searchTerm || youtubeVideo,
      width: 320,
      height: 200
    });
  }
  
  // Add regular images
  imagesToRender.forEach((item, index) => {
    items.push({
      type: 'image',
      ...item,
      index: index
    });
  });
  
  return (
  <div style={{ display: 'flex', flexDirection: 'row', gap: 4, height: 200, width: '100%', overflowX: 'auto', overflowY: 'hidden', alignItems: 'flex-start' }}>
    {
    items.length > 0 ? (
        items.map((item, index) => {
          if (item.type === 'youtube') {
            // YouTube video item
            const videoWidth = 320; // Fixed width for video
            const dynamicCardStyle = {
              ...cardStyle,
              width: videoWidth,
              maxWidth: videoWidth,
              background: 'transparent'
            };
            
            return (
              <div key={`youtube-${index}`} style={dynamicCardStyle}>
                <YouTubeVideo
                  videoId={item.videoId}
                  searchTerm={item.searchTerm}
                  width={videoWidth}
                  height={200}
                />
              </div>
            );
          } else {
            // Regular image item
            const imageUrl = typeof item === 'string' ? item : item.url;
            const width = item.width || 300;
            const height = item.height || 200;
            
            // Calculate aspect ratio and apply max-width for horizontal images
            const isHorizontal = width > height;
            const aspectRatio = width / height;
            const maxWidth = isHorizontal ? Math.min(350, 200 * aspectRatio) : 200 / aspectRatio;
            
            const dynamicCardStyle = {
              ...cardStyle,
              width: maxWidth,
              maxWidth: isHorizontal ? '350px' : 'auto'
            };
            
            const dynamicImgStyle = {
              ...imgStyle,
              width: maxWidth,
              maxWidth: isHorizontal ? '350px' : 'auto'
            };
            
            return (
              <div key={`image-${item.index || index}`} style={dynamicCardStyle}>
                <div style={{ position: 'relative' }}>
                  <img src={imageUrl} alt={`Gallery ${item.index + 1 || index + 1}`} style={dynamicImgStyle} />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    borderRadius: 20,
                    pointerEvents: 'none'
                  }} />
                </div>
              </div>
            );
          }
        })
    ) : null}
  </div>
  );
};

export default ImageGallery; 