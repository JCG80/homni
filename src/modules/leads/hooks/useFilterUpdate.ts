
import { useCallback } from 'react';
import { userFiltersApi } from '../api/user-filters';
import { UserLeadFilter, UpdateUserFilterRequest } from '../types/user-filters';
import { toast } from "@/hooks/use-toast";
import { withRetry } from '@/utils/apiRetry';
import { useAuth } from '@/modules/auth/hooks';
import { UserRole } from '@/modules/auth/utils/roles/types';
import { canAccessModule } from '@/modules/auth/utils/roleUtils';
import { UseFilterHookProps } from '@/types/hooks';

/**
 * Hook for updating filters with automatic retry and role-based access control
 */
export function useFilterUpdate({
  setFilters,
  activeFilter,
  setActiveFilter,
  setIsLoading
}: Pick<UseFilterHookProps, 'setFilters' | 'activeFilter' | 'setActiveFilter' | 'setIsLoading'>) {
  const { role } = useAuth();
  
  // Check if user has access to manage filters
  const canManageFilters = role ? canAccessModule(role as UserRole, 'leads') : false;
  
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

  return {
    updateFilter,
    canManageFilters
  };
}
