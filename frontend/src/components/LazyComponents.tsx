'use client';

import dynamic from 'next/dynamic';
import React, { ComponentType } from 'react';

// Loading component for better UX
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Lazy load heavy components
export const LazyVideoAvatar = dynamic(() => import('./VideoAvatar'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // Disable SSR for video component
});

// @ts-ignore - Dynamic import type issue
export const LazyArcadeEmbed = dynamic(() => import('./ArcadeEmbed'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center"><span className="text-gray-500">Cargando demo...</span></div>,
  ssr: false
});

// @ts-ignore - Dynamic import type issue
export const LazyApiSneakPeek = dynamic(() => import('./ApiSneakPeek'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
});

// @ts-ignore - Dynamic import type issue
export const LazyCasosDeUso = dynamic(() => import('./CasosDeUso'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
});

// @ts-ignore - Dynamic import type issue
export const LazyMXNBSection = dynamic(() => import('./MXNBSection'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
});

// @ts-ignore - Dynamic import type issue
export const LazyEarlyAccessForm = dynamic(() => import('./EarlyAccessForm'), {
  loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false
});

// Intersection Observer Hook for lazy loading
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.1, ...options }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options]);

  return isIntersecting;
}

// Lazy Section Wrapper - Mobile-First
interface LazySectionProps {
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
  forceDesktop?: boolean; // Force lazy loading on desktop too
}

export function LazySection({ children, className = '', fallback, forceDesktop = false }: LazySectionProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const isVisible = useIntersectionObserver(ref, { threshold: 0.1 });

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Mobile breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Only apply lazy loading on mobile (unless forceDesktop is true)
  const shouldLazyLoad = isMobile || forceDesktop;

  return (
    <div ref={ref} className={className}>
      {shouldLazyLoad ? 
        (isVisible ? children : (fallback || <div className="h-96 bg-gray-50 animate-pulse rounded-lg" />))
        : children
      }
    </div>
  );
}
