
import { useCallback } from 'react';
import { userFiltersApi } from '../api/user-filters';
import { UserLeadFilter, CreateUserFilterRequest, UpdateUserFilterRequest } from '../types/user-filters';
import { toast } from '@/hooks/use-toast';
import { withRetry } from '@/utils/apiRetry';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { canAccessModule } from '@/modules/auth/utils/roleUtils';

interface UseFilterOperationsProps {
  filters: UserLeadFilter[];
  setFilters: (filters: UserLeadFilter[] | ((prev: UserLeadFilter[]) => UserLeadFilter[])) => void;
  activeFilter: UserLeadFilter | null;
  setActiveFilter: (filter: UserLeadFilter | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

/**
 * Hook for filter CRUD operations with automatic retry and role-based access control
 */
export function useFilterOperations({
  filters,
  setFilters,
  activeFilter,
  setActiveFilter,
  setIsLoading
}: UseFilterOperationsProps) {
  const { role } = useAuth();
  
  // Check if user has access to manage filters
  const canManageFilters = role ? canAccessModule(role, 'leads') : false;
  
  // Create a new filter with retry logic
  const createFilter = useCallback(async (filter: CreateUserFilterRequest): Promise<boolean> => {
    if (!canManageFilters) {
      toast({
        title: 'Access denied',
        description: 'You do not have permission to create filters',
        variant: 'destructive',
      });
      return false;
    }
    
    setIsLoading(true);
    
    try {
      const newFilter = await withRetry(
        () => userFiltersApi.createUserFilter(filter),
        {
          maxAttempts: 3,
          onRetry: (attempt) => {
            console.log(`Retrying create filter (attempt ${attempt})...`);
          }
        }
      );
      
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
      console.error('Error creating filter after retry attempts:', err);
      
      toast({
        title: 'Error creating filter',
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [filters, setFilters, setActiveFilter, setIsLoading, canManageFilters]);
  
  // Update an existing filter with retry logic
  const updateFilter = useCallback(async (id: string, updates: UpdateUserFilterRequest): Promise<boolean> => {
    if (!canManageFilters) {
      toast({
        title: 'Access denied',
        description: 'You do not have permission to update filters',
        variant: 'destructive',
      });
      return false;
    }
    
    setIsLoading(true);
    
    try {
      const updatedFilter = await withRetry(
        () => userFiltersApi.updateUserFilter(id, updates),
        {
          maxAttempts: 3,
          onRetry: (attempt) => {
            console.log(`Retrying update filter (attempt ${attempt})...`);
          }
        }
      );
      
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
      console.error('Error updating filter after retry attempts:', err);
      
      toast({
        title: 'Error updating filter',
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, setFilters, setActiveFilter, setIsLoading, canManageFilters]);
  
  // Delete a filter with retry logic
  const deleteFilter = useCallback(async (id: string): Promise<boolean> => {
    if (!canManageFilters) {
      toast({
        title: 'Access denied',
        description: 'You do not have permission to delete filters',
        variant: 'destructive',
      });
      return false;
    }
    
    setIsLoading(true);
    
    try {
      const success = await withRetry(
        () => userFiltersApi.deleteUserFilter(id),
        {
          maxAttempts: 3,
          onRetry: (attempt) => {
            console.log(`Retrying delete filter (attempt ${attempt})...`);
          }
        }
      );
      
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
      console.error('Error deleting filter after retry attempts:', err);
      
      toast({
        title: 'Error deleting filter',
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [filters, activeFilter, setFilters, setActiveFilter, setIsLoading, canManageFilters]);

  return {
    createFilter,
    updateFilter,
    deleteFilter,
    canManageFilters
  };
}
