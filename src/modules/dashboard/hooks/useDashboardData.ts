/**
 * Dashboard data fetching hook
 * Provides standardized TanStack Query integration for dashboard widgets
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { DashboardQueryResult, DashboardFilter, TimeRange } from '../types';

interface UseDashboardDataOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: (string | number | object)[];
  fetcher: () => Promise<T>;
  staleTime?: number;
  refetchInterval?: number;
  filters?: DashboardFilter;
}

/**
 * Hook for fetching dashboard data with standardized caching and error handling
 */
export function useDashboardData<T = any>({
  queryKey,
  fetcher,
  staleTime = 5 * 60 * 1000, // 5 minutes default
  refetchInterval,
  filters,
  ...options
}: UseDashboardDataOptions<T>): DashboardQueryResult<T> {
  const fullQueryKey = filters 
    ? [...queryKey, 'filters', filters]
    : queryKey;

  const query = useQuery({
    queryKey: fullQueryKey,
    queryFn: fetcher,
    staleTime,
    refetchInterval,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });

  return {
    data: query.data as T,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
    lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : undefined,
  };
}

/**
 * Helper hook for time-based dashboard queries
 */
export function useTimeBasedDashboardData<T = any>(
  baseQueryKey: string[],
  fetcher: (timeRange: TimeRange) => Promise<T>,
  timeRange: TimeRange = '24h',
  options?: Omit<UseDashboardDataOptions<T>, 'queryKey' | 'fetcher'>
): DashboardQueryResult<T> {
  return useDashboardData({
    queryKey: [...baseQueryKey, timeRange],
    fetcher: () => fetcher(timeRange),
    staleTime: getStaleTimeForRange(timeRange),
    refetchInterval: getRefreshIntervalForRange(timeRange),
    ...options,
  });
}

/**
 * Helper hook for user-specific dashboard data
 */
export function useUserDashboardData<T = any>(
  baseQueryKey: string[],
  userId: string,
  fetcher: (userId: string) => Promise<T>,
  options?: Omit<UseDashboardDataOptions<T>, 'queryKey' | 'fetcher'>
): DashboardQueryResult<T> {
  return useDashboardData({
    queryKey: [...baseQueryKey, 'user', userId],
    fetcher: () => fetcher(userId),
    ...options,
  });
}

/**
 * Get appropriate stale time based on data freshness requirements
 */
function getStaleTimeForRange(timeRange: TimeRange): number {
  switch (timeRange) {
    case '1h':
      return 1 * 60 * 1000; // 1 minute
    case '24h':
      return 5 * 60 * 1000; // 5 minutes
    case '7d':
      return 15 * 60 * 1000; // 15 minutes
    case '30d':
    case '90d':
      return 30 * 60 * 1000; // 30 minutes
    case 'all':
      return 60 * 60 * 1000; // 1 hour
    default:
      return 5 * 60 * 1000;
  }
}

/**
 * Get appropriate refresh interval based on data volatility
 */
function getRefreshIntervalForRange(timeRange: TimeRange): number | undefined {
  switch (timeRange) {
    case '1h':
      return 30 * 1000; // 30 seconds
    case '24h':
      return 2 * 60 * 1000; // 2 minutes
    case '7d':
      return 5 * 60 * 1000; // 5 minutes
    default:
      return undefined; // No auto-refresh for longer periods
  }
}