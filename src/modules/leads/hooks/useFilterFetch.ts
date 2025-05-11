
import { useCallback } from 'react';
import { userFiltersApi } from '../api/filters';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { UserLeadFilter } from '../types/user-filters';
import { withRetry, withTimeout } from '@/utils/apiRetry';
import { toast } from '@/hooks/use-toast';

interface UseFilterFetchProps {
  setFilters: (filters: UserLeadFilter[]) => void;
  setActiveFilter: (filter: UserLeadFilter | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Hook for fetching user filters with enhanced retry capability
 */
export function useFilterFetch({
  setFilters,
  setActiveFilter,
  setIsLoading,
  setError
}: UseFilterFetchProps) {
  const { user } = useAuth();
  
  // Load user filters when component mounts with retry capability
  const loadUserFilters = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userFilters = await withRetry(
        () => withTimeout(userFiltersApi.getUserFilters(), 10000),
        {
          maxAttempts: 3,
          onRetry: (attempt, error) => {
            console.log(`Retrying filter fetch (attempt ${attempt}):`, error);
            toast({
              title: `Attempt ${attempt} failed`,
              description: "Retrying to load filters...",
              variant: "default"
            });
          },
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
      
      setFilters(userFilters);
      
      // Set active filter to default if there is one
      const defaultFilter = userFilters.find(f => f.is_default);
      if (defaultFilter) {
        setActiveFilter(defaultFilter);
      } else if (userFilters.length > 0) {
        // Otherwise use the first filter
        setActiveFilter(userFilters[0]);
      } else {
        // No filters found, set active filter to null
        setActiveFilter(null);
      }
    } catch (err) {
      console.error('Error loading user filters after retry attempts:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      toast({
        title: 'Error loading filters',
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, setFilters, setActiveFilter, setIsLoading, setError]);
  
  return { loadUserFilters };
}
