'use client';

import { useState, useRef, useEffect } from 'react';

interface OptimizedVideoProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  lazy?: boolean;
  width?: number;
  height?: number;
}

export default function OptimizedVideo({
  src,
  poster,
  className = '',
  autoPlay = false,
  loop = false,
  muted = true,
  controls = false,
  lazy = true,
  width,
  height
}: OptimizedVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, shouldLoad]);

  // Reduce video quality on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: width && height ? `${width}/${height}` : '16/9' }}
    >
      {shouldLoad ? (
        <video
          ref={videoRef}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          autoPlay={autoPlay && !isMobile} // Disable autoplay on mobile
          loop={loop}
          muted={muted}
          controls={controls}
          poster={poster}
          preload={isMobile ? 'none' : 'metadata'} // Reduce preload on mobile
          onLoadedData={() => setIsLoaded(true)}
          width={width}
          height={height}
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        // Placeholder while lazy loading
        <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="text-gray-400">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
      
      {!isLoaded && shouldLoad && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
    </div>
  );
}
