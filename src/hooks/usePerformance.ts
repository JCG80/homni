/**
 * Performance Monitoring and Optimization Hooks
 */

import { useCallback, useEffect, useRef } from 'react';
import { logger } from '@/utils/logger';

interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
}

/**
 * Hook for measuring component render performance
 */
export function useRenderMetrics(componentName: string) {
  const startTime = useRef<number | undefined>(undefined);
  
  // Start measuring on mount
  useEffect(() => {
    startTime.current = performance.now();
    
    return () => {
      if (startTime.current) {
        const duration = performance.now() - startTime.current;
        const metrics: PerformanceMetrics = {
          name: componentName,
          duration,
          timestamp: Date.now()
        };
        
        // Log slow renders (>16ms for 60fps)
        if (duration > 16) {
          logger.warn(`Slow render detected: ${componentName}`, { metrics });
        }
        
        // Store metrics for analysis
        if (import.meta.env.DEV) {
          console.log(`${componentName} render time: ${duration.toFixed(2)}ms`);
        }
      }
    };
  }, [componentName]);
}

/**
 * Hook for measuring async operation performance
 */
export function useAsyncMetrics() {
  return useCallback(<T>(operation: Promise<T>, operationName: string): Promise<T> => {
    const startTime = performance.now();
    
    return operation
      .then((result) => {
        const duration = performance.now() - startTime;
        logger.info(`${operationName} completed`, { duration: `${duration.toFixed(2)}ms` });
        return result;
      })
      .catch((error) => {
        const duration = performance.now() - startTime;
        logger.error(`${operationName} failed`, { duration: `${duration.toFixed(2)}ms`, error });
        throw error;
      });
  }, []);
}

/**
 * Hook for debouncing expensive operations
 */
export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]) as T;
}

/**
 * Hook for throttling high-frequency operations
 */
export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  limit: number
): T {
  const inThrottle = useRef(false);
  
  return useCallback((...args: Parameters<T>) => {
    if (!inThrottle.current) {
      callback(...args);
      inThrottle.current = true;
      setTimeout(() => {
        inThrottle.current = false;
      }, limit);
    }
  }, [callback, limit]) as T;
}

/**
 * Hook for monitoring component memory usage
 */
export function useMemoryMonitor(componentName: string) {
  useEffect(() => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      
      logger.info(`Memory usage for ${componentName}`, {
        usedJSHeapSize: `${(memInfo.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        totalJSHeapSize: `${(memInfo.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        jsHeapSizeLimit: `${(memInfo.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
      });
    }
  }, [componentName]);
}