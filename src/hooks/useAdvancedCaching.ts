/**
 * Advanced Caching Hook - Smart cache management for dashboard data
 * Phase 4: Performance & Polish
 */

import { useEffect, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useIntegratedAuth } from '@/modules/auth/hooks/useIntegratedAuth';
import { logger } from '@/utils/logger';

interface CacheStrategy {
  key: string;
  ttl: number;
  priority: 'high' | 'medium' | 'low';
  preload?: boolean;
}

interface AdvancedCachingOptions {
  enableBackgroundSync?: boolean;
  enablePredictivePreloading?: boolean;
  maxCacheSize?: number;
  cacheCompressionEnabled?: boolean;
}

/**
 * Advanced caching hook with intelligent cache management
 */
export const useAdvancedCaching = (options: AdvancedCachingOptions = {}) => {
  const {
    enableBackgroundSync = true,
    enablePredictivePreloading = true,
    maxCacheSize = 50, // MB
    cacheCompressionEnabled = false
  } = options;

  const queryClient = useQueryClient();
  const { user } = useIntegratedAuth();

  // Cache strategies based on data type and user behavior
  const cacheStrategies = useMemo<CacheStrategy[]>(() => [
    {
      key: 'user-profile',
      ttl: 15 * 60 * 1000, // 15 minutes
      priority: 'high',
      preload: true
    },
    {
      key: 'dashboard-widgets',
      ttl: 5 * 60 * 1000, // 5 minutes
      priority: 'high',
      preload: true
    },
    {
      key: 'notifications',
      ttl: 2 * 60 * 1000, // 2 minutes
      priority: 'medium',
      preload: false
    },
    {
      key: 'insights',
      ttl: 10 * 60 * 1000, // 10 minutes
      priority: 'medium',
      preload: true
    },
    {
      key: 'behavior-events',
      ttl: 1 * 60 * 1000, // 1 minute
      priority: 'low',
      preload: false
    }
  ], []);

  // Intelligent cache preloading based on user patterns
  const preloadPredictiveData = useCallback(async () => {
    if (!enablePredictivePreloading || !user) return;

    try {
      const highPriorityStrategies = cacheStrategies.filter(
        s => s.priority === 'high' && s.preload
      );

      await Promise.allSettled(
        highPriorityStrategies.map(async (strategy) => {
          const queryKey = [strategy.key, user.id];
          
          // Only preload if not already cached or stale
          const cachedData = queryClient.getQueryData(queryKey);
          if (!cachedData) {
            await queryClient.prefetchQuery({
              queryKey,
              queryFn: () => fetchDataForStrategy(strategy),
              staleTime: strategy.ttl,
            });
          }
        })
      );

      logger.debug('Predictive preloading completed');
    } catch (error) {
      logger.error('Predictive preloading failed', { error });
    }
  }, [enablePredictivePreloading, user, cacheStrategies, queryClient]);

  // Background synchronization of cache data
  const backgroundSync = useCallback(async () => {
    if (!enableBackgroundSync || !user) return;

    try {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      // Find stale queries that need background refresh
      const staleQueries = queries.filter(query => {
        const strategy = cacheStrategies.find(s => 
          query.queryKey.includes(s.key)
        );
        
        if (!strategy) return false;
        
        const lastUpdate = query.state.dataUpdatedAt;
        const isStale = Date.now() - lastUpdate > strategy.ttl;
        
        return isStale && query.getObserversCount() > 0;
      });

      // Background refresh stale queries
      await Promise.allSettled(
        staleQueries.map(async (query) => {
          await queryClient.invalidateQueries({
            queryKey: query.queryKey,
            refetchType: 'none' // Silent background refresh
          });
        })
      );

      logger.debug('Background sync completed', { 
        refreshedQueries: staleQueries.length 
      });
    } catch (error) {
      logger.error('Background sync failed', { error });
    }
  }, [enableBackgroundSync, user, cacheStrategies, queryClient]);

  // Memory-aware cache cleanup
  const optimizeCacheMemory = useCallback(() => {
    try {
      const memory = (performance as any).memory;
      if (!memory) return;

      const currentMemoryMB = memory.usedJSHeapSize / 1024 / 1024;
      
      if (currentMemoryMB > maxCacheSize) {
        const cache = queryClient.getQueryCache();
        const queries = cache.getAll();
        
        // Remove low priority, unused queries first
        const lowPriorityQueries = queries
          .filter(query => {
            const strategy = cacheStrategies.find(s => 
              query.queryKey.includes(s.key)
            );
            return strategy?.priority === 'low' && query.getObserversCount() === 0;
          })
          .sort((a, b) => a.state.dataUpdatedAt - b.state.dataUpdatedAt);

        // Remove oldest low priority queries
        const toRemove = lowPriorityQueries.slice(0, Math.ceil(lowPriorityQueries.length * 0.3));
        toRemove.forEach(query => cache.remove(query));

        logger.debug('Cache memory optimized', { 
          removedQueries: toRemove.length,
          memoryMB: currentMemoryMB 
        });
      }
    } catch (error) {
      logger.error('Cache memory optimization failed', { error });
    }
  }, [maxCacheSize, cacheStrategies, queryClient]);

  // Smart cache invalidation based on user actions
  const smartInvalidate = useCallback((action: string, context?: any) => {
    const invalidationMap: Record<string, string[]> = {
      'profile-update': ['user-profile', 'dashboard-widgets'],
      'preference-change': ['user-preferences', 'dashboard-widgets', 'insights'],
      'behavior-event': ['behavior-events', 'insights'],
      'notification-read': ['notifications'],
      'widget-interaction': ['dashboard-widgets', 'behavior-events']
    };

    const keysToInvalidate = invalidationMap[action] || [];
    
    keysToInvalidate.forEach(key => {
      queryClient.invalidateQueries({
        queryKey: [key, user?.id],
        refetchType: 'active'
      });
    });

    logger.debug('Smart cache invalidation', { action, keys: keysToInvalidate });
  }, [queryClient, user]);

  // Initialize cache management
  useEffect(() => {
    if (!user) return;

    let syncInterval: NodeJS.Timeout;
    let memoryInterval: NodeJS.Timeout;

    // Initial preload
    preloadPredictiveData();

    if (enableBackgroundSync) {
      // Background sync every 5 minutes
      syncInterval = setInterval(backgroundSync, 5 * 60 * 1000);
    }

    // Memory optimization every 2 minutes
    memoryInterval = setInterval(optimizeCacheMemory, 2 * 60 * 1000);

    return () => {
      if (syncInterval) clearInterval(syncInterval);
      if (memoryInterval) clearInterval(memoryInterval);
    };
  }, [user, enableBackgroundSync, preloadPredictiveData, backgroundSync, optimizeCacheMemory]);

  return {
    preloadPredictiveData,
    backgroundSync,
    optimizeCacheMemory,
    smartInvalidate,
    cacheStrategies
  };
};

// Helper function to fetch data based on strategy
async function fetchDataForStrategy(strategy: CacheStrategy): Promise<any> {
  // This would be replaced with actual API calls based on the strategy
  switch (strategy.key) {
    case 'user-profile':
      return fetch('/api/user/profile').then(r => r.json());
    case 'dashboard-widgets':
      return fetch('/api/dashboard/widgets').then(r => r.json());
    case 'notifications':
      return fetch('/api/notifications').then(r => r.json());
    case 'insights':
      return fetch('/api/insights').then(r => r.json());
    case 'behavior-events':
      return fetch('/api/behavior/events').then(r => r.json());
    default:
      return null;
  }
}