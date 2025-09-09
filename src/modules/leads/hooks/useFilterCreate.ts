
import { useCallback } from 'react';
import { userFiltersApi } from '../api/user-filters';
import { UserLeadFilter, CreateUserFilterRequest } from '../types/user-filters';
import { toast } from "@/components/ui/use-toast";
import { withRetry } from '@/utils/apiRetry';
import { useAuth } from '@/modules/auth/hooks';
import { UserRole } from '@/modules/auth/utils/roles/types';
import { canAccessModule } from '@/modules/auth/utils/roleUtils';
import { UseFilterHookProps } from '@/types/hooks';

/**
 * Hook for creating new filters with automatic retry and role-based access control
 */
export function useFilterCreate({
  filters,
  setFilters,
  setActiveFilter,
  setIsLoading
}: Pick<UseFilterHookProps, 'filters' | 'setFilters' | 'activeFilter' | 'setActiveFilter' | 'setIsLoading'>) {
  const { role } = useAuth();
  
  // Check if user has access to manage filters
  const canManageFilters = role ? canAccessModule(role as UserRole, 'leads') : false;
  
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

  return {
    createFilter,
    canManageFilters
  };
}
