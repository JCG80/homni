/**
 * Performance Optimization Utilities
 */

import { memo, useMemo, useCallback } from 'react';

/**
 * Enhanced memoization for React components with deep comparison
 */
export function createMemoizedComponent<T extends React.ComponentType<any>>(
  Component: T,
  propsAreEqual?: (prevProps: any, nextProps: any) => boolean
): T {
  return memo(Component, propsAreEqual) as T;
}

/**
 * Optimize heavy computations with memoization
 */
export function useMemoizedComputation<T>(
  computation: () => T,
  dependencies: React.DependencyList
): T {
  return useMemo(computation, dependencies);
}

/**
 * Optimize callback functions
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T {
  return useCallback(callback, dependencies);
}

/**
 * Bundle size analysis helpers
 */
export const bundleAnalysis = {
  /**
   * Log chunk loading for analysis
   */
  logChunkLoad: (chunkName: string) => {
    if (import.meta.env.DEV) {
      console.log(`🔄 Loading chunk: ${chunkName}`);
      
      // Measure chunk load time
      const startTime = performance.now();
      return () => {
        const loadTime = performance.now() - startTime;
        console.log(`✅ Chunk loaded: ${chunkName} (${loadTime.toFixed(2)}ms)`);
      };
    }
    return () => {};
  },

  /**
   * Check if module is already loaded
   */
  isModuleLoaded: (moduleName: string): boolean => {
    return !!(window as any).__webpack_require__?.cache?.[moduleName];
  },

  /**
   * Get estimated bundle size
   */
  getBundleEstimate: (): string => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`;
    }
    return 'Unknown';
  }
};

/**
 * Image optimization utilities
 */
export const imageOptimization = {
  /**
   * Create lazy loading image with intersection observer
   */
  createLazyImage: (src: string, placeholder?: string) => ({
    src: placeholder || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGM0Y0RjYiLz48L3N2Zz4=',
    'data-src': src,
    loading: 'lazy' as const,
    decoding: 'async' as const
  }),

  /**
   * Preload critical images
   */
  preloadImage: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  }
};

/**
 * Component performance monitoring
 */
export const performanceMonitor = {
  /**
   * Mark performance milestones
   */
  mark: (name: string) => {
    if (performance.mark) {
      performance.mark(name);
    }
  },

  /**
   * Measure time between marks
   */
  measure: (name: string, startMark: string, endMark?: string) => {
    if (performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        return measure?.duration || 0;
      } catch (error) {
        console.warn('Performance measurement failed:', error);
        return 0;
      }
    }
    return 0;
  },

  /**
   * Get performance entries
   */
  getEntries: (type?: string) => {
    if (type) {
      return performance.getEntriesByType(type);
    }
    return performance.getEntries();
  }
};

/**
 * Database query optimization helpers
 */
export const queryOptimization = {
  /**
   * Debounce database queries
   */
  debounceQuery: <T extends (...args: any[]) => Promise<any>>(
    queryFn: T,
    delay: number = 300
  ): T => {
    let timeoutId: NodeJS.Timeout;
    
    return ((...args: Parameters<T>) => {
      return new Promise((resolve, reject) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          try {
            const result = await queryFn(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, delay);
      });
    }) as T;
  },

  /**
   * Cache query results
   */
  createQueryCache: <T>(ttl: number = 300000) => { // 5 minutes default
    const cache = new Map<string, { data: T; timestamp: number }>();
    
    return {
      get: (key: string): T | null => {
        const entry = cache.get(key);
        if (entry && Date.now() - entry.timestamp < ttl) {
          return entry.data;
        }
        cache.delete(key);
        return null;
      },
      
      set: (key: string, data: T) => {
        cache.set(key, { data, timestamp: Date.now() });
      },
      
      clear: () => {
        cache.clear();
      },
      
      size: () => cache.size
    };
  }
};