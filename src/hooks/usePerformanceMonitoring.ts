import { useState, useEffect, useCallback } from 'react';
import { useIntegratedAuth } from '@/modules/auth/hooks/useIntegratedAuth';
import { logger } from '@/utils/logger';

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  navigationTime: number;
  cacheHitRate: number;
  apiResponseTimes: Record<string, number>;
  bundleSize: number;
}

interface PerformanceConfig {
  enableMetrics: boolean;
  sampleRate: number;
  reportingInterval: number;
}

export const usePerformanceMonitoring = (config?: Partial<PerformanceConfig>) => {
  const { user, role } = useIntegratedAuth();
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
  const [isEnabled, setIsEnabled] = useState(false);
  
  const defaultConfig: PerformanceConfig = {
    enableMetrics: true,
    sampleRate: 0.1, // 10% sampling
    reportingInterval: 30000, // 30 seconds
  };
  
  const finalConfig = { ...defaultConfig, ...config };

  useEffect(() => {
    // Only enable for a sample of users to avoid performance impact
    const shouldEnable = Math.random() < finalConfig.sampleRate;
    setIsEnabled(finalConfig.enableMetrics && shouldEnable);
  }, [finalConfig.enableMetrics, finalConfig.sampleRate]);

  const measureWebVitals = useCallback(() => {
    if (!isEnabled || typeof window === 'undefined') return;

    try {
      // Navigation timing
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationTiming) {
        const pageLoadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
        setMetrics(prev => ({ ...prev, pageLoadTime, navigationTime: pageLoadTime }));
      }

      // Web Vitals
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          setMetrics(prev => ({ ...prev, largestContentfulPaint: lastEntry.startTime }));
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.processingStart && entry.startTime) {
              const firstInputDelay = entry.processingStart - entry.startTime;
              setMetrics(prev => ({ ...prev, firstInputDelay }));
            }
          });
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        let cumulativeLayoutShift = 0;
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              cumulativeLayoutShift += entry.value;
            }
          });
          setMetrics(prev => ({ ...prev, cumulativeLayoutShift }));
        }).observe({ entryTypes: ['layout-shift'] });
      }

      // Paint timing
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({ ...prev, firstContentfulPaint: entry.startTime }));
        }
      });
    } catch (error) {
      logger.warn('Performance monitoring error', { 
        module: 'performance',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }, [isEnabled]);

  const measureApiPerformance = useCallback((endpoint: string, duration: number) => {
    if (!isEnabled) return;
    
    setMetrics(prev => ({
      ...prev,
      apiResponseTimes: {
        ...prev.apiResponseTimes,
        [endpoint]: duration
      }
    }));

    // Log slow API calls
    if (duration > 2000) {
      logger.warn('Slow API response detected', {
        module: 'performance',
        endpoint,
        duration: `${duration}ms`,
        userId: user?.id,
        userRole: role
      });
    }
  }, [isEnabled, user?.id, role]);

  const calculateCacheHitRate = useCallback(() => {
    if (!isEnabled || typeof window === 'undefined') return;

    try {
      // Check for cached resources
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      let cacheHits = 0;
      let totalRequests = 0;

      resourceEntries.forEach(entry => {
        totalRequests++;
        // Resource was served from cache if transfer size is 0 but encoded body size > 0
        if (entry.transferSize === 0 && entry.encodedBodySize > 0) {
          cacheHits++;
        }
      });

      const cacheHitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;
      setMetrics(prev => ({ ...prev, cacheHitRate }));
    } catch (error) {
      logger.warn('Cache hit rate calculation error', { 
        module: 'performance',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }, [isEnabled]);

  const reportMetrics = useCallback(async () => {
    if (!isEnabled || !user) return;

    try {
      const metricsToReport = {
        ...metrics,
        timestamp: Date.now(),
        userId: user.id,
        userRole: role,
        userAgent: navigator.userAgent,
        url: window.location.href,
        connectionType: (navigator as any).connection?.effectiveType || 'unknown'
      };

      // Log metrics for development
      logger.info('Performance metrics', {
        module: 'performance',
        metrics: metricsToReport
      });

      // In production, send to analytics service
      // await analyticsService.track('performance_metrics', metricsToReport);
    } catch (error) {
      logger.error('Performance metrics reporting error', {
        module: 'performance',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }, [isEnabled, metrics, user, role]);

  useEffect(() => {
    if (!isEnabled) return;

    measureWebVitals();
    calculateCacheHitRate();

    const interval = setInterval(() => {
      calculateCacheHitRate();
      reportMetrics();
    }, finalConfig.reportingInterval);

    return () => clearInterval(interval);
  }, [isEnabled, measureWebVitals, calculateCacheHitRate, reportMetrics, finalConfig.reportingInterval]);

  // Bundle size monitoring
  useEffect(() => {
    if (!isEnabled) return;

    // Estimate bundle size from script tags
    const scriptTags = document.querySelectorAll('script[src]');
    let estimatedBundleSize = 0;
    
    scriptTags.forEach(script => {
      const src = (script as HTMLScriptElement).src;
      if (src && src.includes('assets')) {
        // Rough estimation based on resource timing
        const resourceEntry = performance.getEntriesByName(src)[0] as PerformanceResourceTiming;
        if (resourceEntry && resourceEntry.encodedBodySize) {
          estimatedBundleSize += resourceEntry.encodedBodySize;
        }
      }
    });

    if (estimatedBundleSize > 0) {
      setMetrics(prev => ({ ...prev, bundleSize: estimatedBundleSize }));
    }
  }, [isEnabled]);

  return {
    metrics,
    isEnabled,
    measureApiPerformance,
    reportMetrics,
    getPerformanceScore: () => {
      const { 
        largestContentfulPaint = 0, 
        firstInputDelay = 0, 
        cumulativeLayoutShift = 0 
      } = metrics;
      
      // Simple scoring based on Web Vitals thresholds
      let score = 100;
      if (largestContentfulPaint > 4000) score -= 30;
      else if (largestContentfulPaint > 2500) score -= 15;
      
      if (firstInputDelay > 300) score -= 30;
      else if (firstInputDelay > 100) score -= 15;
      
      if (cumulativeLayoutShift > 0.25) score -= 30;
      else if (cumulativeLayoutShift > 0.1) score -= 15;
      
      return Math.max(0, score);
    }
  };
};