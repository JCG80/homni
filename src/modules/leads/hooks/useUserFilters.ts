
import { useEffect } from 'react';
import { useFilterState } from './useFilterState';
import { useFilterFetch } from './useFilterFetch';
import { useFilterCreate } from './useFilterCreate';
import { useFilterUpdate } from './useFilterUpdate';
import { useFilterDelete } from './useFilterDelete';
import { useFilterPermissions } from './useFilterPermissions';
import { toast } from "@/components/ui/use-toast";

/**
 * Unified hook for managing user lead filters with automatic retry and role-based access
 */
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
  
  const { createFilter } = useFilterCreate({
    filters,
    setFilters,
    activeFilter,
    setActiveFilter,
    setIsLoading
  });
  
  const { updateFilter } = useFilterUpdate({
    setFilters,
    activeFilter,
    setActiveFilter,
    setIsLoading
  });
  
  const { deleteFilter } = useFilterDelete({
    filters,
    activeFilter,
    setFilters,
    setActiveFilter,
    setIsLoading
  });
  
  const { canManageFilters } = useFilterPermissions();
  
  // Load filters on mount
  useEffect(() => {
    loadUserFilters().catch(err => {
      console.error("Failed to load filters:", err);
      toast({
        title: "Error",
        description: "Could not load your saved filters. Please try again later.",
        variant: "destructive",
      });
    });
  }, [loadUserFilters]);
  
  // Return the combined API
  return {
    // State
    filters,
    activeFilter,
    isLoading,
    error,
    
    // Access control
    canManageFilters,
    
    // Operations
    loadUserFilters,
    createFilter,
    updateFilter,
    deleteFilter,
    setActiveFilter: setActiveFilterById,
  };
}
