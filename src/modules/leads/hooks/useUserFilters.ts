import { useState, useEffect, useCallback } from 'react';
import { userFiltersApi } from '../api/user-filters';
import { UserLeadFilter, CreateUserFilterRequest, UpdateUserFilterRequest } from '../types/user-filters';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export function useUserFilters() {
  const [filters, setFilters] = useState<UserLeadFilter[]>([]);
  const [activeFilter, setActiveFilter] = useState<UserLeadFilter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
  }, [user]);
  
  // Load filters on mount and when user changes
  useEffect(() => {
    loadUserFilters();
  }, [loadUserFilters]);
  
  // Create a new filter
  const createFilter = async (filter: CreateUserFilterRequest): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const newFilter = await userFiltersApi.createUserFilter(filter);
      
      if (newFilter) {
        // Update local state
        setFilters(prev => [...prev, newFilter]);
        
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
  };
  
  // Update an existing filter
  const updateFilter = async (id: string, updates: UpdateUserFilterRequest): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const updatedFilter = await userFiltersApi.updateUserFilter(id, updates);
      
      if (updatedFilter) {
        // Update local state
        setFilters(prev => prev.map(f => f.id === id ? updatedFilter : f));
        
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
  };
  
  // Delete a filter
  const deleteFilter = async (id: string): Promise<boolean> => {
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
  };
  
  // Set a filter as the active one
  const setActiveFilterById = (id: string) => {
    const filter = filters.find(f => f.id === id);
    if (filter) {
      setActiveFilter(filter);
    }
  };
  
  return {
    filters,
    activeFilter,
    isLoading,
    error,
    loadUserFilters,
    createFilter,
    updateFilter,
    deleteFilter,
    setActiveFilter: setActiveFilterById,
  };
}
