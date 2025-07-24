import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import YazekaHeader from '../../base/atoms/YazekaHeader';
import OneImage from '../atom/OneImage';
import ImageGallery from '../atom/ImageGallery';
import ImageSkeleton from '../atom/ImageSkeleton';

const YazekaImageBlock = ({ showImage = true, text = '', imageUrls = [], expectedImages = 0, imageDimensions = [], youtubeVideo = null, isStreaming = false }) => {
  
  // Split text for single images: first sentence, then rest
  const splitTextForSingleImage = (fullText) => {
    if (!fullText || expectedImages !== 1) return { firstSentence: fullText, restText: '', shouldShowSkeleton: false };
    
    // Find first sentence ending (. ! ? followed by space or end)
    const sentenceMatch = fullText.match(/^(.*?[.!?])\s+(.*)$/s);
    if (sentenceMatch) {
      const firstSentence = sentenceMatch[1].trim();
      const restText = sentenceMatch[2].trim();
      
      // Show skeleton if first sentence is complete and we have rest text or are not streaming
      const shouldShowSkeleton = !isStreaming && restText.length > 0;
      
      return {
        firstSentence,
        restText,
        shouldShowSkeleton
      };
    }
    
    // If no sentence break found but not streaming, show skeleton
    const shouldShowSkeleton = !isStreaming && fullText.length > 0;
    return { firstSentence: fullText, restText: '', shouldShowSkeleton };
  };
  
  const { firstSentence, restText, shouldShowSkeleton } = splitTextForSingleImage(text);
  console.log("🎨 YazekaImageBlock received:");
  console.log("  - showImage:", showImage);
  console.log("  - imageUrls:", imageUrls);
  console.log("  - imageUrls.length:", imageUrls.length);
  console.log("  - expectedImages:", expectedImages);
  console.log("  - imageDimensions:", imageDimensions);
  console.log("  - isStreaming:", isStreaming);
  console.log("  - text.length:", text.length);
  
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  
  // Show skeleton logic
  useEffect(() => {
    console.log("🦴 Skeleton logic triggered:", {
      showImage,
      expectedImages,
      isStreaming,
      imageUrlsLength: imageUrls.length,
      textLength: text.length
    });

    if (showImage && expectedImages > 1) {
      // Multiple images: show skeleton while loading
      console.log("🦴 Multiple images: showing skeleton");
      setShowSkeleton(true);
      setAllImagesLoaded(false);
    } else if (showImage && expectedImages === 1) {
      // Single image: show skeleton as soon as we expect an image and have some text
      if (imageUrls.length === 0 && text.length > 20) {
        console.log("🦴 Single image: showing skeleton (no images yet, have text)");
        setShowSkeleton(true);
        setAllImagesLoaded(false);
      } else if (imageUrls.length > 0) {
        console.log("🦴 Single image: hiding skeleton (images loaded)");
        setShowSkeleton(false);
        setAllImagesLoaded(true);
      } else {
        console.log("🦴 Single image: no skeleton (waiting for text)");
        setShowSkeleton(false);
        setAllImagesLoaded(false);
      }
    } else {
      // No images: no skeleton
      console.log("🦴 No images expected: no skeleton");
      setShowSkeleton(false);
      setAllImagesLoaded(true);
    }
  }, [showImage, expectedImages, imageUrls.length, text.length]);

  useEffect(() => {
    if (showImage && imageUrls.length > 0) {
      let loadedCount = 0;
      const totalImages = imageUrls.length;

      const preloadImages = () => {
        imageUrls.forEach((url) => {
          const img = new Image();
          img.onload = () => {
            loadedCount++;
            if (loadedCount === totalImages) {
              setAllImagesLoaded(true);
            }
          };
          img.onerror = () => {
            loadedCount++;
            if (loadedCount === totalImages) {
              setAllImagesLoaded(true);
            }
          };
          img.src = url;
        });
      };

      preloadImages();
    }
  }, [showImage, imageUrls]);

  // Hide skeleton when all images are loaded
  useEffect(() => {
    if (allImagesLoaded && !isStreaming) {
      setShowSkeleton(false);
    }
  }, [allImagesLoaded, isStreaming]);

  const renderMarkdownText = (textContent) => (
    <ReactMarkdown
      components={{
        // Custom styling for markdown elements
        strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
        em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
        p: ({ children }) => <p style={{ margin: '0 0 8px 0' }}>{children}</p>,
        h1: ({ children }) => <h1 style={{ fontSize: '1.5em', margin: '8px 0', fontWeight: 600 }}>{children}</h1>,
        h2: ({ children }) => <h2 style={{ fontSize: '1.3em', margin: '8px 0', fontWeight: 600 }}>{children}</h2>,
        h3: ({ children }) => <h3 style={{ fontSize: '1.1em', margin: '8px 0', fontWeight: 600 }}>{children}</h3>,
        ul: ({ children }) => <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>{children}</ul>,
        ol: ({ children }) => <ol style={{ margin: '4px 0', paddingLeft: '20px' }}>{children}</ol>,
        li: ({ children }) => <li style={{ margin: '2px 0' }}>{children}</li>,
        code: ({ children }) => <code style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '2px 4px', 
          borderRadius: '3px',
          fontSize: '0.9em',
          fontFamily: 'monospace'
        }}>{children}</code>,
        blockquote: ({ children }) => <blockquote style={{ 
          borderLeft: '3px solid #ddd',
          paddingLeft: '12px',
          margin: '8px 0',
          fontStyle: 'italic',
          color: '#666'
        }}>{children}</blockquote>
      }}
    >
      {textContent || ''}
    </ReactMarkdown>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      <YazekaHeader />
      
      {/* Multiple images: ImageGallery above text with skeleton */}
      {expectedImages > 1 && showImage && showSkeleton ? (
        <ImageSkeleton count={expectedImages} imageDimensions={imageDimensions} />
      ) : expectedImages > 1 && showImage && imageUrls.length > 1 ? (
        (() => {
          console.log("🎨 Rendering ImageGallery for:", imageUrls.length, "images");
          return <ImageGallery imageUrls={imageUrls} imagesWithDimensions={imageDimensions} youtubeVideo={youtubeVideo} />;
        })()
      ) : showImage && youtubeVideo && expectedImages === 0 ? (
        (() => {
          console.log("🎨 Rendering ImageGallery with YouTube video only");
          return <ImageGallery imageUrls={[]} imagesWithDimensions={[]} youtubeVideo={youtubeVideo} />;
        })()
      ) : null}
      
      {/* Multiple images OR YouTube-only: Full text below content */}
      {(expectedImages > 1 || (youtubeVideo && expectedImages === 0)) ? (
        <div style={{ minHeight: '1.2em', lineHeight: '1.5' }}>
          {renderMarkdownText(text)}
        </div>
      ) : null}
      
      {/* Single image: First sentence */}
      {expectedImages === 1 && firstSentence ? (
        <div style={{ minHeight: '1.2em', lineHeight: '1.5' }}>
          {renderMarkdownText(firstSentence)}
        </div>
      ) : null}
      
      {/* Single image: Skeleton or actual image */}
      {expectedImages === 1 && showImage && showSkeleton && imageUrls.length === 0 ? (
        <ImageSkeleton count={1} imageDimensions={imageDimensions} />
      ) : expectedImages === 1 && showImage && imageUrls.length === 1 ? (
        (() => {
          console.log("🎨 Rendering OneImage for:", imageUrls[0]);
          return <OneImage 
            imageUrl={imageUrls[0]} 
            width={imageDimensions[0]?.width} 
            height={imageDimensions[0]?.height} 
          />;
        })()
      ) : null}
      
      {/* Single image: Rest of text after image */}
      {expectedImages === 1 && restText ? (
        <div style={{ minHeight: '1.2em', lineHeight: '1.5' }}>
          {renderMarkdownText(restText)}
        </div>
      ) : null}
      
      {/* No images: Show all text */}
      {expectedImages === 0 ? (
        <div style={{ minHeight: '1.2em', lineHeight: '1.5' }}>
          {renderMarkdownText(text)}
        </div>
      ) : null}
    </div>
  );
};

export default YazekaImageBlock; 