
import { useEffect } from 'react';
import { useFilterState } from './useFilterState';
import { useFilterFetch } from './useFilterFetch';
import { useFilterOperations } from './useFilterOperations';

export function useUserFilters() {
  // Use the separate hooks for managing different aspects of filter state and operations
  const {
    filters,
    setFilters,
    activeFilter,
    setActiveFilter,
    isLoading,
    setIsLoading,
    error,
    setError,
    setActiveFilterById
  } = useFilterState();
  
  const { loadUserFilters } = useFilterFetch({
    setFilters,
    setActiveFilter,
    setIsLoading,
    setError
  });
  
  const {
    createFilter,
    updateFilter,
    deleteFilter
  } = useFilterOperations({
    filters,
    setFilters,
    activeFilter,
    setActiveFilter,
    setIsLoading
  });
  
  // Load filters on mount
  useEffect(() => {
    loadUserFilters();
  }, [loadUserFilters]);
  
  // Return the combined API
  return {
    // State
    filters,
    activeFilter,
    isLoading,
    error,
    
    // Operations
    loadUserFilters,
    createFilter,
    updateFilter,
    deleteFilter,
    setActiveFilter: setActiveFilterById,
  };
}
