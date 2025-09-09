
import { useCallback } from 'react';
import { userFiltersApi } from '../api/user-filters';
import { UserLeadFilter } from '../types/user-filters';
import { toast } from "@/components/ui/use-toast";
import { withRetry } from '@/utils/apiRetry';
import { useAuth } from '@/modules/auth/hooks';
import { UserRole } from '@/modules/auth/utils/roles/types';
import { canAccessModule } from '@/modules/auth/utils/roleUtils';
import { UseFilterHookProps } from '@/types/hooks';

/**
 * Hook for deleting filters with automatic retry and role-based access control
 */
export function useFilterDelete({
  filters,
  activeFilter,
  setFilters,
  setActiveFilter,
  setIsLoading
}: Pick<UseFilterHookProps, 'filters' | 'activeFilter' | 'setFilters' | 'setActiveFilter' | 'setIsLoading'>) {
  const { role } = useAuth();
  
  // Check if user has access to manage filters
  const canManageFilters = role ? canAccessModule(role as UserRole, 'leads') : false;
  
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
    deleteFilter,
    canManageFilters
  };
}
