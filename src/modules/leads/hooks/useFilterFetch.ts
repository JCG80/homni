import { useCallback } from 'react';
import { userFiltersApi } from '../api/user-filters';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { UserLeadFilter } from '../types/user-filters';

interface UseFilterFetchProps {
  setFilters: (filters: UserLeadFilter[]) => void;
  setActiveFilter: (filter: UserLeadFilter | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Hook for fetching user filters
 */
export function useFilterFetch({
  setFilters,
  setActiveFilter,
  setIsLoading,
  setError
}: UseFilterFetchProps) {
  const { user } = useAuth();
  
  // Load user filters when component mounts
  const loadUserFilters = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userFilters = await userFiltersApi.getUserFilters();
      setFilters(userFilters);
      
      // Set active filter to default if there is one
      const defaultFilter = userFilters.find(f => f.is_default);
      if (defaultFilter) {
        setActiveFilter(defaultFilter);
      } else if (userFilters.length > 0) {
        // Otherwise use the first filter
        setActiveFilter(userFilters[0]);
      }
    } catch (err) {
      console.error('Error loading user filters:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [user, setFilters, setActiveFilter, setIsLoading, setError]);
  
  return { loadUserFilters };
}
