/**
 * Advanced Performance Monitoring Hook
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { MemoryManager } from '@/lib/performance/memory-management';
import { queryClient, cacheCleanup } from '@/lib/performance/caching';
import { queryPerformanceMonitor } from '@/lib/performance/database-optimization';

interface AdvancedPerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  queryPerformance: {
    averageTime: number;
    slowQueries: number;
  };
  bundleMetrics: {
    chunksLoaded: number;
    totalSize: number;
    cacheEfficiency: number;
  };
  networkMetrics: {
    requests: number;
    failures: number;
    averageLatency: number;
  };
}

export const useAdvancedPerformance = (componentName: string) => {
  const [metrics, setMetrics] = useState<AdvancedPerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    queryPerformance: { averageTime: 0, slowQueries: 0 },
    bundleMetrics: { chunksLoaded: 0, totalSize: 0, cacheEfficiency: 0 },
    networkMetrics: { requests: 0, failures: 0, averageLatency: 0 },
  });

  const renderStartTime = useRef<number>(performance.now());
  const memoryManager = useRef(MemoryManager.getInstance());
  const queryTimes = useRef<number[]>([]);
  const networkRequests = useRef<{ time: number; success: boolean }[]>([]);

  // Measure render performance
  const measureRenderTime = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;
    
    if (import.meta.env.DEV && renderTime > 16) {
      console.warn(`[PERFORMANCE] ${componentName} render took ${renderTime.toFixed(2)}ms (> 16ms)`);
    }

    setMetrics(prev => ({ ...prev, renderTime }));
  }, [componentName]);

  // Track query performance
  const trackQuery = useCallback(async <T>(
    queryName: string, 
    queryFn: () => Promise<T>
  ): Promise<T> => {
    return queryPerformanceMonitor.timeQuery(queryName, async () => {
      const start = performance.now();
      try {
        const result = await queryFn();
        const duration = performance.now() - start;
        queryTimes.current.push(duration);
        
        // Keep only last 50 query times for average
        if (queryTimes.current.length > 50) {
          queryTimes.current.shift();
        }
        
        return result;
      } catch (error) {
        queryTimes.current.push(performance.now() - start);
        throw error;
      }
    });
  }, []);

  // Track network requests
  const trackNetworkRequest = useCallback((url: string, success: boolean, latency: number) => {
    networkRequests.current.push({ time: latency, success });
    
    // Keep only last 100 requests
    if (networkRequests.current.length > 100) {
      networkRequests.current.shift();
    }

    // Update network metrics
    const requests = networkRequests.current.length;
    const failures = networkRequests.current.filter(r => !r.success).length;
    const averageLatency = networkRequests.current.reduce((sum, r) => sum + r.time, 0) / requests || 0;

    setMetrics(prev => ({
      ...prev,
      networkMetrics: { requests, failures, averageLatency }
    }));
  }, []);

  // Get cache statistics
  const updateCacheMetrics = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    let hits = 0;
    let total = 0;
    
    queries.forEach(query => {
      total++;
      if (query.state.dataUpdatedAt > Date.now() - 30000) { // Fresh within 30s
        hits++;
      }
    });

    const cacheHitRate = total > 0 ? (hits / total) * 100 : 0;
    setMetrics(prev => ({ ...prev, cacheHitRate }));
  }, []);

  // Monitor memory usage
  const updateMemoryMetrics = useCallback(() => {
    const memoryStats = memoryManager.current.getMemoryStats();
    if (memoryStats.supported) {
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memoryStats.usagePercentage
      }));
    }
  }, []);

  // Update bundle metrics
  const updateBundleMetrics = useCallback(() => {
    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(r => r.name.endsWith('.js'));
    
    const chunksLoaded = jsResources.length;
    const totalSize = jsResources.reduce((sum, r: any) => sum + (r.transferSize || 0), 0);
    const cachedResources = jsResources.filter((r: any) => r.transferSize === 0 && r.decodedBodySize > 0);
    const cacheEfficiency = chunksLoaded > 0 ? (cachedResources.length / chunksLoaded) * 100 : 0;

    setMetrics(prev => ({
      ...prev,
      bundleMetrics: { chunksLoaded, totalSize, cacheEfficiency }
    }));
  }, []);

  // Update query performance metrics
  const updateQueryMetrics = useCallback(() => {
    if (queryTimes.current.length === 0) return;

    const averageTime = queryTimes.current.reduce((sum, time) => sum + time, 0) / queryTimes.current.length;
    const slowQueries = queryTimes.current.filter(time => time > 1000).length;

    setMetrics(prev => ({
      ...prev,
      queryPerformance: { averageTime, slowQueries }
    }));
  }, []);

  // Performance optimization actions
  const optimizePerformance = useCallback(async () => {
    // Clear old cache entries
    cacheCleanup.optimizeMemoryUsage();
    
    // Force memory cleanup
    memoryManager.current.performCleanup();
    
    // Clear performance entries
    if (performance.clearResourceTimings) {
      performance.clearResourceTimings();
    }
    
    // Update metrics after optimization
    setTimeout(() => {
      updateMemoryMetrics();
      updateCacheMetrics();
      updateBundleMetrics();
    }, 1000);
  }, [updateMemoryMetrics, updateCacheMetrics, updateBundleMetrics]);

  // Get performance recommendations
  const getRecommendations = useCallback((): string[] => {
    const recommendations: string[] = [];

    if (metrics.renderTime > 16) {
      recommendations.push('Consider optimizing render performance - use React.memo or useMemo');
    }

    if (metrics.memoryUsage > 75) {
      recommendations.push('High memory usage detected - consider clearing caches or reducing data retention');
    }

    if (metrics.cacheHitRate < 60) {
      recommendations.push('Low cache hit rate - review cache strategies and TTL settings');
    }

    if (metrics.queryPerformance.averageTime > 500) {
      recommendations.push('Slow database queries detected - consider query optimization or indexing');
    }

    if (metrics.queryPerformance.slowQueries > 0) {
      recommendations.push(`${metrics.queryPerformance.slowQueries} slow queries detected - review database performance`);
    }

    if (metrics.bundleMetrics.cacheEfficiency < 70) {
      recommendations.push('Poor bundle caching - consider optimizing cache headers and bundle splitting');
    }

    if (metrics.networkMetrics.failures > metrics.networkMetrics.requests * 0.1) {
      recommendations.push('High network failure rate - check API reliability and error handling');
    }

    if (metrics.networkMetrics.averageLatency > 1000) {
      recommendations.push('High network latency - consider request optimization or CDN usage');
    }

    return recommendations;
  }, [metrics]);

  // Initialize performance monitoring
  useEffect(() => {
    renderStartTime.current = performance.now();
    
    // Set up periodic metric updates
    const interval = setInterval(() => {
      updateMemoryMetrics();
      updateCacheMetrics();
      updateBundleMetrics();
      updateQueryMetrics();
    }, 5000); // Update every 5 seconds

    // Measure initial render
    const timeoutId = setTimeout(measureRenderTime, 0);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [measureRenderTime, updateMemoryMetrics, updateCacheMetrics, updateBundleMetrics, updateQueryMetrics]);

  // Monitor network requests
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const start = performance.now();
      try {
        const response = await originalFetch(...args);
        const latency = performance.now() - start;
        trackNetworkRequest(args[0].toString(), response.ok, latency);
        return response;
      } catch (error) {
        const latency = performance.now() - start;
        trackNetworkRequest(args[0].toString(), false, latency);
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [trackNetworkRequest]);

  return {
    metrics,
    trackQuery,
    optimizePerformance,
    getRecommendations,
    measureRenderTime,
  };
};
