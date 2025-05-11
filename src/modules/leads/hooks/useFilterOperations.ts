
import { useCallback } from 'react';
import { userFiltersApi } from '../api/user-filters';
import { UserLeadFilter, CreateUserFilterRequest, UpdateUserFilterRequest } from '../types/user-filters';
import { toast } from '@/hooks/use-toast';

interface UseFilterOperationsProps {
  filters: UserLeadFilter[];
  setFilters: (filters: UserLeadFilter[]) => void;
  activeFilter: UserLeadFilter | null;
  setActiveFilter: (filter: UserLeadFilter | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

/**
 * Hook for filter CRUD operations
 */
export function useFilterOperations({
  filters,
  setFilters,
  activeFilter,
  setActiveFilter,
  setIsLoading
}: UseFilterOperationsProps) {
  // Create a new filter
  const createFilter = useCallback(async (filter: CreateUserFilterRequest): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const newFilter = await userFiltersApi.createUserFilter(filter);
      
      if (newFilter) {
        // Update local state with proper typing
        setFilters((prev: UserLeadFilter[]) => [...prev, newFilter]);
        
        // If this is a default filter or there are no other filters, set it as active
        if (filter.is_default || filters.length === 0) {
          setActiveFilter(newFilter);
        }
        
        toast({
          title: 'Filter created',
          description: 'Your filter has been saved',
        });
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating filter:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [filters, setFilters, setActiveFilter, setIsLoading]);
  
  // Update an existing filter
  const updateFilter = useCallback(async (id: string, updates: UpdateUserFilterRequest): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const updatedFilter = await userFiltersApi.updateUserFilter(id, updates);
      
      if (updatedFilter) {
        // Update local state with proper typing
        setFilters((prev: UserLeadFilter[]) => prev.map(f => f.id === id ? updatedFilter : f));
        
        // Update active filter if it was the one that was updated
        if (activeFilter && activeFilter.id === id) {
          setActiveFilter(updatedFilter);
        }
        
        // If this filter was set as default, make sure it's the active one
        if (updates.is_default) {
          setActiveFilter(updatedFilter);
        }
        
        toast({
          title: 'Filter updated',
          description: 'Your filter has been updated',
        });
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating filter:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, setFilters, setActiveFilter, setIsLoading]);
  
  // Delete a filter
  const deleteFilter = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const success = await userFiltersApi.deleteUserFilter(id);
      
      if (success) {
        // Update local state
        const newFilters = filters.filter(f => f.id !== id);
        setFilters(newFilters);
        
        // If we deleted the active filter, set a new active filter
        if (activeFilter && activeFilter.id === id) {
          const newActiveFilter = newFilters.find(f => f.is_default) || newFilters[0] || null;
          setActiveFilter(newActiveFilter);
        }
        
        toast({
          title: 'Filter deleted',
          description: 'Your filter has been deleted',
        });
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting filter:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [filters, activeFilter, setFilters, setActiveFilter, setIsLoading]);

  return {
    createFilter,
    updateFilter,
    deleteFilter
  };
}
