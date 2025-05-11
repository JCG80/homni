
import { useState, useCallback } from 'react';
import { UserLeadFilter } from '../types/user-filters';

/**
 * Hook for managing filter state
 */
export function useFilterState() {
  const [filters, setFilters] = useState<UserLeadFilter[]>([]);
  const [activeFilter, setActiveFilter] = useState<UserLeadFilter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Set a filter as the active one by ID
  const setActiveFilterById = useCallback((id: string) => {
    setFilters(currentFilters => {
      const filter = currentFilters.find(f => f.id === id);
      if (filter) {
        setActiveFilter(filter);
      }
      return currentFilters;
    });
  }, []);
  
  return {
    filters,
    setFilters,
    activeFilter,
    setActiveFilter,
    isLoading,
    setIsLoading,
    error,
    setError,
    setActiveFilterById,
  };
}
