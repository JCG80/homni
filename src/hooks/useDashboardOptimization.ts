/**
 * Dashboard optimization hook - orchestrates performance improvements
 */

import { useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardCache } from '@/lib/dashboard/cache';
import { cacheCleanup } from '@/lib/performance/caching';
import { measureAsync } from '@/utils/performance';

interface UseDashboardOptimizationProps {
  userId?: string;
  userRole?: string;
  companyId?: string;
  enablePerformanceMonitoring?: boolean;
}

/**
 * Comprehensive dashboard optimization hook
 * Handles caching, preloading, performance monitoring, and memory management
 */
export const useDashboardOptimization = ({
  userId,
  userRole,
  companyId,
  enablePerformanceMonitoring = process.env.NODE_ENV === 'development'
}: UseDashboardOptimizationProps) => {
  
  // Fetch dashboard data with optimized caching
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard-optimized', userId, userRole, companyId],
    queryFn: async () => {
      return await measureAsync(async () => {
        if (userRole === 'company' && companyId) {
          return await DashboardCache.fetchCompanyDashboard(companyId);
        } else if ((userRole === 'admin' || userRole === 'master_admin')) {
          return await DashboardCache.fetchAdminDashboard();
        } else if (userId) {
          return await DashboardCache.fetchUserDashboard(userId);
        }
        return null;
      }, 'dashboard-data-fetch');
    },
    enabled: !!(userId || companyId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Preload related data for better UX
  const preloadRelatedData = useCallback(async () => {
    if (!userId) return;

    try {
      await DashboardCache.preloadUserData(userId);
    } catch (error) {
      console.warn('Preload failed:', error);
    }
  }, [userId]);

  // Initialize performance optimizations
  useEffect(() => {
    let cleanupInterval: NodeJS.Timeout;

    if (enablePerformanceMonitoring) {
      // Start periodic cache cleanup
      cleanupInterval = cacheCleanup.startPeriodicCleanup();
      
      // Preload data on component mount
      preloadRelatedData();
    }

    return () => {
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
      }
    };
  }, [enablePerformanceMonitoring, preloadRelatedData]);

  // Invalidate cache when data changes
  const invalidateCache = useCallback(() => {
    DashboardCache.invalidateDashboard(userId, companyId);
  }, [userId, companyId]);

  // Refresh dashboard data
  const refreshDashboard = useCallback(async () => {
    invalidateCache();
    return await refetch();
  }, [invalidateCache, refetch]);

  const getPerformanceMetrics = useCallback(() => {
    if (!enablePerformanceMonitoring) return null;
    
    const memory = (performance as any).memory;
    return {
      cacheSize: memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0,
      isDataCached: !!dashboardData,
      lastFetch: dashboardData?.lastUpdated || null,
    };
  }, [enablePerformanceMonitoring, dashboardData]);

  return {
    // Data
    dashboardData,
    isLoading,
    error,
    
    // Actions  
    refreshDashboard,
    invalidateCache,
    preloadRelatedData,
    
    // Performance
    performanceMetrics: getPerformanceMetrics(),
    
    // Status
    isOptimized: !isLoading && !error && !!dashboardData,
  };
};