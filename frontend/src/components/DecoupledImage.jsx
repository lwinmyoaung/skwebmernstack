import { useState, useEffect } from 'react';

/**
 * DecoupledImage Component
 * 
 * Splits UI rendering from image loading by:
 * 1. Rendering a stable placeholder (skeleton) immediately.
 * 2. Delaying the actual image 'src' assignment until the UI is stable.
 * 3. Using background decoding to prevent main-thread jank.
 */
const DecoupledImage = ({ 
  src, 
  alt, 
  className = '', 
  containerClass = '',
  aspectRatio = 'aspect-square',
  delay = 500,
  priority = 'low' 
}) => {
  const [isReadyToLoad, setIsReadyToLoad] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Wait for the specified delay after component mount
    // to ensure the main UI rendering process is finished.
    const timer = setTimeout(() => {
      setIsReadyToLoad(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`relative overflow-hidden ${aspectRatio} ${containerClass}`}>
      {/* Shimmer Placeholder (Renders Immediately) */}
      {!hasLoaded && (
        <div className="absolute inset-0 bg-white/5 animate-pulse z-0" />
      )}

      {/* The Actual Image (Loads after UI is stable) */}
      {isReadyToLoad && (
        <img
          src={src}
          alt={alt}
          loading={priority === 'high' ? 'eager' : 'lazy'}
          fetchpriority={priority}
          decoding="async"
          onLoad={() => setHasLoaded(true)}
          className={`
            w-full h-full object-cover transition-opacity duration-700
            ${hasLoaded ? 'opacity-100' : 'opacity-0'}
            ${className}
          `}
        />
      )}
    </div>
  );
};

export default DecoupledImage;
