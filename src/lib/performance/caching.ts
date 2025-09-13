/**
 * Advanced Caching Layer for Performance Optimization
 */

import { QueryClient } from '@tanstack/react-query';

// Enhanced cache configuration
export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Aggressive caching for stable data
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
        // Optimistic updates for better UX
        onMutate: async () => {
          // Cancel outgoing refetches
          await queryClient.cancelQueries();
        },
      },
    },
  });
};

// Memory-efficient cache instance
export const queryClient = createOptimizedQueryClient();

// Cache strategies for different data types
export const cacheStrategies = {
  // Static/semi-static data (user profiles, settings)
  static: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  },
  
  // Frequently changing data (leads, analytics)
  dynamic: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
  
  // Real-time data (notifications, live metrics)
  realtime: {
    staleTime: 0,
    gcTime: 2 * 60 * 1000, // 2 minutes
  },
  
  // Heavy computational data (reports, analytics)
  computational: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  },
};

// Prefetching utilities
export const prefetchStrategies = {
  prefetchUserData: async (userId: string) => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['user-profile', userId],
        queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
        ...cacheStrategies.static,
      }),
      queryClient.prefetchQuery({
        queryKey: ['user-preferences', userId],
        queryFn: () => fetch(`/api/users/${userId}/preferences`).then(r => r.json()),
        ...cacheStrategies.static,
      }),
    ]);
  },

  prefetchDashboardData: async (userRole: string) => {
    const queries = [
      queryClient.prefetchQuery({
        queryKey: ['dashboard-metrics'],
        queryFn: () => fetch('/api/dashboard/metrics').then(r => r.json()),
        ...cacheStrategies.dynamic,
      }),
    ];

    if (userRole === 'admin' || userRole === 'master_admin') {
      queries.push(
        queryClient.prefetchQuery({
          queryKey: ['admin-stats'],
          queryFn: () => fetch('/api/admin/stats').then(r => r.json()),
          ...cacheStrategies.dynamic,
        })
      );
    }

    await Promise.all(queries);
  },
};

// Cache invalidation patterns
export const invalidationPatterns = {
  onUserUpdate: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
    queryClient.invalidateQueries({ queryKey: ['user-preferences', userId] });
  },

  onLeadUpdate: (leadId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    if (leadId) {
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
    }
    queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
  },

  onCompanyUpdate: (companyId: string) => {
    queryClient.invalidateQueries({ queryKey: ['company', companyId] });
    queryClient.invalidateQueries({ queryKey: ['companies'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
  },
};

// Memory management
export const cacheCleanup = {
  // Clear old cache entries
  clearStaleCache: () => {
    queryClient.getQueryCache().clear();
    queryClient.getMutationCache().clear();
  },

  // Selective cleanup based on memory pressure
  optimizeMemoryUsage: () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    // Remove queries that haven't been used in the last 10 minutes
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    
    queries.forEach(query => {
      if (query.state.dataUpdatedAt < tenMinutesAgo && !query.getObserversCount()) {
        cache.remove(query);
      }
    });
  },

  // Periodic cleanup
  startPeriodicCleanup: () => {
    // Clean up every 15 minutes
    return setInterval(() => {
      cacheCleanup.optimizeMemoryUsage();
    }, 15 * 60 * 1000);
  },
};