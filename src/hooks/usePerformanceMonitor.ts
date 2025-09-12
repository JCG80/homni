import { useEffect, useCallback } from 'react';
import { PerformanceMetrics } from '@/types/metrics';
import { logger } from '@/utils/logger';

export const usePerformanceMonitor = (componentName: string) => {
  const startTime = performance.now();
  
  const logPerformance = useCallback((metrics: Partial<PerformanceMetrics>) => {
    if (import.meta.env.DEV) {
      logger.info(`[Performance] ${componentName}:`, {
        componentName,
        loadTime: performance.now() - startTime,
        ...metrics
      });
    }
  }, [componentName, startTime]);

  useEffect(() => {
    const endTime = performance.now();
    logPerformance({ 
      loadTime: endTime - startTime,
      renderTime: endTime - startTime 
    });
  }, [logPerformance, startTime]);

  return { logPerformance };
};