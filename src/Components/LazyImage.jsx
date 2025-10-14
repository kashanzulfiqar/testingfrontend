import React, { useState, useRef, useEffect } from 'react';
import { Spin } from 'antd';

const LazyImage = ({ 
  src, 
  alt, 
  placeholder, 
  className, 
  style, 
  threshold = 0.1,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div ref={imgRef} className={className} style={style}>
      {isInView && (
        <>
          {!isLoaded && !hasError && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '200px'
            }}>
              <Spin size="large" />
            </div>
          )}
          <img
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            style={{
              display: isLoaded && !hasError ? 'block' : 'none',
              width: '100%',
              height: 'auto'
            }}
            {...props}
          />
          {hasError && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px',
              backgroundColor: '#f5f5f5',
              color: '#999'
            }}>
              Failed to load image
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LazyImage;
