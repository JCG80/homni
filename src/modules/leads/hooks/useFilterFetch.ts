
import { useCallback } from 'react';
import { userFiltersApi } from '../api/user-filters';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { UserLeadFilter } from '../types/user-filters';
import { withRetry } from '@/utils/apiRetry';
import { toast } from '@/hooks/use-toast';

interface UseFilterFetchProps {
  setFilters: (filters: UserLeadFilter[]) => void;
  setActiveFilter: (filter: UserLeadFilter | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Hook for fetching user filters with retry capability
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
        () => userFiltersApi.getUserFilters(),
        {
          maxAttempts: 3,
          onRetry: (attempt, error) => {
            console.log(`Retrying filter fetch (attempt ${attempt}):`, error);
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
