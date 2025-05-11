
import { useCallback } from 'react';
import { userFiltersApi } from '../api/user-filters';
import { withRetry, withTimeout } from '@/utils/apiRetry';

/**
 * Hook for handling filter API calls with retry logic
 */
export function useFilterRetry() {
  /**
   * Fetch user filters with retry and timeout
   */
  const fetchFiltersWithRetry = useCallback(async (onRetryCallback?: (attempt: number, error: any) => void) => {
    return await withRetry(
      () => withTimeout(userFiltersApi.getUserFilters(), 10000),
      {
        maxAttempts: 3,
        onRetry: onRetryCallback || ((attempt, error) => {
          console.log(`Retrying filter fetch (attempt ${attempt}):`, error);
        }),
        // Only retry on specific errors
        retryableErrors: (error) => {
          // Don't retry on permission errors
          if (error?.message?.includes('permission denied')) {
            return false;
          }
          
          // Retry on network errors or server errors
          return true;
        }
      }
    );
  }, []);

  return { fetchFiltersWithRetry };
}
