import React, { useState } from 'react';
import PlayButton from '../../base/atoms/PlayButton';
import FullscreenVideoPlayer from './FullscreenVideoPlayer';

const YouTubeVideo = ({ videoId, searchTerm, width = 320, height = 180 }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);

  // Extract video ID from search term or use provided ID
  const getVideoId = () => {
    if (videoId) return videoId;
    // For now, we'll use a placeholder. In production, you'd search YouTube API
    return 'dQw4w9WgXcQ'; // Rick Roll as fallback
  };

  const finalVideoId = getVideoId();
  const thumbnailUrl = `https://img.youtube.com/vi/${finalVideoId}/maxresdefault.jpg`;
  const videoUrl = `https://www.youtube.com/watch?v=${finalVideoId}`;

  const handlePlay = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  const handleThumbnailLoad = () => {
    setThumbnailLoaded(true);
  };

  const handleThumbnailError = () => {
    // Fallback to standard quality thumbnail
    const fallbackUrl = `https://img.youtube.com/vi/${finalVideoId}/hqdefault.jpg`;
    setThumbnailLoaded(true);
  };

  return (
    <>
      <div 
        style={{
          position: 'relative',
          width: width,
          height: height,
          borderRadius: 12,
          overflow: 'hidden',
          cursor: 'pointer',
          background: '#f0f0f0'
        }}
        onClick={handlePlay}
      >
        <img
          src={thumbnailUrl}
          alt={searchTerm || 'YouTube Video'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: thumbnailLoaded ? 'block' : 'none'
          }}
          onLoad={handleThumbnailLoad}
          onError={handleThumbnailError}
        />
        
        {/* Dark overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderRadius: 12
        }} />
        
        {/* Play button */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}>
          <PlayButton size={64} onClick={handlePlay} />
        </div>
        
        {/* YouTube badge */}
        <div style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '2px 6px',
          borderRadius: 4,
          fontSize: 10,
          fontWeight: 'bold'
        }}>
          YouTube
        </div>
      </div>

      {/* Fullscreen video player */}
      {isFullscreen && (
        <FullscreenVideoPlayer
          videoId={finalVideoId}
          searchTerm={searchTerm}
          onClose={handleCloseFullscreen}
        />
      )}
    </>
  );
};

export default YouTubeVideo;