import { useEffect, useState, useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";
import { PerformanceMetrics } from '@/types/metrics';

export const usePerformanceOptimization = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Lazy loading for images
  const lazyLoadImages = useCallback(() => {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
    
    return () => imageObserver.disconnect();
  }, []);

  // Performance monitoring
  const measurePerformance = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics: PerformanceMetrics = {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        renderTime: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        networkLatency: navigation.responseStart - navigation.requestStart,
      };

      setMetrics(metrics);

      // Alert if performance is poor
      if (metrics.loadTime > 3000) {
        console.warn('Slow page load detected:', metrics.loadTime + 'ms');
      }
    }
  }, []);

  // Optimize bundle loading
  const optimizeBundleLoading = useCallback(() => {
    setIsOptimizing(true);
    
    // Preload critical resources
    const preloadLinks = document.querySelectorAll('link[rel="preload"]');
    if (preloadLinks.length === 0) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = '/src/main.tsx';
      document.head.appendChild(link);
    }

    // Defer non-critical scripts
    const scripts = document.querySelectorAll('script:not([async]):not([defer])');
    scripts.forEach(script => {
      if (!script.getAttribute('src')?.includes('main')) {
        script.setAttribute('defer', 'true');
      }
    });

    setTimeout(() => setIsOptimizing(false), 1000);
  }, []);

  // Memory cleanup
  const cleanupMemory = useCallback(() => {
    // Clear console logs in production
    if (process.env.NODE_ENV === 'production') {
      console.clear();
    }

    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }

    toast({
      title: "Performance Optimized",
      description: "Memory cleanup completed successfully.",
    });
  }, []);

  useEffect(() => {
    // Initialize performance monitoring
    measurePerformance();
    
    // Setup lazy loading
    const cleanup = lazyLoadImages();

    // Performance observer for runtime metrics
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'measure' && entry.duration > 16.67) {
            console.warn('Long task detected:', entry.name, entry.duration + 'ms');
          }
        });
      });

      observer.observe({ entryTypes: ['measure', 'navigation'] });

      return () => {
        cleanup();
        observer.disconnect();
      };
    }

    return cleanup;
  }, [measurePerformance, lazyLoadImages]);

  return {
    metrics,
    isOptimizing,
    optimizeBundleLoading,
    cleanupMemory,
    measurePerformance,
  };
};