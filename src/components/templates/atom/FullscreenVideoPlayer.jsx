import React, { useEffect, useRef } from 'react';

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M18 6L6 18M6 6L18 18" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const FullscreenVideoPlayer = ({ videoId, searchTerm, onClose }) => {
  const overlayRef = useRef(null);

  // Handle escape key to close video
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    // Prevent body scroll when overlay is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  // Handle click outside video to close
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Get video embed URL
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          transition: 'background-color 0.2s ease',
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        <CloseIcon />
      </button>

      {/* Video container */}
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          aspectRatio: '16/9',
          backgroundColor: '#000',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
      >
        <iframe
          src={embedUrl}
          title={searchTerm || 'YouTube Video'}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
        />
      </div>

      {/* Instructions */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '14px',
          textAlign: 'center'
        }}
      >
        Press ESC or click outside to close
      </div>
    </div>
  );
};

export default FullscreenVideoPlayer;