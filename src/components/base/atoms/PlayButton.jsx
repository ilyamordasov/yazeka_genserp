import React from 'react';

const PlayIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.071 4.30302C11.8428 4.16019 11.5881 4.065 11.3222 4.02316C11.0563 3.98132 10.7846 3.9937 10.5236 4.05956C10.2626 4.12542 10.0176 4.2434 9.80338 4.40639C9.58915 4.56939 9.4101 4.77404 9.277 5.00802C9.096 5.32102 9 5.67802 9 6.04102V25.96C9 26.323 9.096 26.68 9.277 26.993C9.459 27.306 9.719 27.565 10.032 27.742C10.3444 27.9189 10.6987 28.0082 11.0576 28.0004C11.4164 27.9927 11.7666 27.8882 12.071 27.698L28.041 17.739C28.3349 17.5554 28.5769 17.2996 28.744 16.996C28.9122 16.691 29.0004 16.3483 29.0004 16C29.0004 15.6517 28.9122 15.3091 28.744 15.004C28.5769 14.7004 28.3349 14.4447 28.041 14.261L12.071 4.30302Z" fill="currentColor"/>
</svg>
);

const PlayButton = ({ onClick, size = 64 }) => {
  return (
    <button
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(5px)',
        border: '0.5px solid #aaaaaa',
        boxShadow: '0px 4px 64px 0px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#000',
        fontSize: 0,
        padding: 0,
        position: 'relative',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = 'rgba(255, 255, 255, 0.9)';
        e.target.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'rgba(255, 255, 255, 0.8)';
        e.target.style.transform = 'scale(1)';
      }}
    >
      <PlayIcon />
    </button>
  );
};

export default PlayButton;