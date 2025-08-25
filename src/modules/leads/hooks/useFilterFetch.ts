import { useCallback } from 'react';
import { useFilterRetry } from './useFilterRetry';
import { useFilterErrorHandling } from './useFilterErrorHandling';
import { UserLeadFilter } from '../types/user-filters';
import { useAuth } from '@/modules/auth/hooks';

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
  const { fetchFiltersWithRetry } = useFilterRetry();
  const { handleFetchError, notifyRetryAttempt } = useFilterErrorHandling();
  
  // Load user filters when component mounts with retry capability
  const loadUserFilters = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userFilters = await fetchFiltersWithRetry(notifyRetryAttempt);
      
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
      handleFetchError(err, setError);
    } finally {
      setIsLoading(false);
    }
  }, [user, setFilters, setActiveFilter, setIsLoading, setError, fetchFiltersWithRetry, handleFetchError, notifyRetryAttempt]);
  
  return { loadUserFilters };
}
