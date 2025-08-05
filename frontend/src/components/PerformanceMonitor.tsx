'use client';

import { useEffect } from 'react';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Web Vitals monitoring
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            console.log('FID:', (entry as any).processingStart - entry.startTime);
          }
          if (entry.entryType === 'layout-shift') {
            if (!(entry as any).hadRecentInput) {
              console.log('CLS:', (entry as any).value);
            }
          }
        });
      });

      // Observe Core Web Vitals
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (e) {
        // Fallback for older browsers
        console.log('Performance Observer not supported');
      }

      // Monitor resource loading
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 1000) { // Log slow resources
            console.warn('Slow resource:', entry.name, entry.duration + 'ms');
          }
        });
      });

      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (e) {
        console.log('Resource Observer not supported');
      }

      return () => {
        observer.disconnect();
        resourceObserver.disconnect();
      };
    }
  }, []);

  return null; // This component doesn't render anything
}
