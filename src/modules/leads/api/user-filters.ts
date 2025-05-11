
import { supabase } from '@/integrations/supabase/client';
import { UserLeadFilter, CreateUserFilterRequest, UpdateUserFilterRequest } from '../types/user-filters';
import { toast } from '@/hooks/use-toast';

/**
 * Fetches all filters for the current user
 */
export async function getUserFilters(): Promise<UserLeadFilter[]> {
  const { data, error } = await supabase
    .from('user_lead_filters')
    .select('*')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user filters:', error);
    toast({
      title: 'Error fetching filters',
      description: error.message,
      variant: 'destructive',
    });
    throw error; // Ensure we throw for retry mechanism
  }
  
  return data as UserLeadFilter[];
}

/**
 * Fetches the default filter for the current user, or creates one if it doesn't exist
 */
export async function getDefaultFilter(): Promise<UserLeadFilter | null> {
  // First try to get existing default filter
  const { data, error } = await supabase
    .from('user_lead_filters')
    .select('*')
    .eq('is_default', true)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching default filter:', error);
    throw error; // Ensure we throw for retry mechanism
  }
  
  // If we found a default filter, return it
  if (data) {
    return data as UserLeadFilter;
  }
  
  // Otherwise create a new default filter
  return createUserFilter({
    filter_name: 'Default',
    filter_data: {},
    is_default: true,
  });
}

/**
 * Creates a new filter for the current user
 */
export async function createUserFilter(filter: CreateUserFilterRequest): Promise<UserLeadFilter | null> {
  try {
    // If this is a default filter, first unset any existing default
    if (filter.is_default) {
      await unsetExistingDefaults();
    }
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting current user:', userError);
      throw userError;
    }
    
    if (!user) {
      const authError = new Error('No authenticated user found');
      console.error(authError);
      toast({
        title: 'Authentication error',
        description: 'You must be logged in to create filters',
        variant: 'destructive',
      });
      throw authError;
    }
    
    const { data, error } = await supabase
      .from('user_lead_filters')
      .insert({
        ...filter,
        user_id: user.id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user filter:', error);
      throw error;
    }
    
    return data as UserLeadFilter;
  } catch (err) {
    console.error('Unexpected error in createUserFilter:', err);
    throw err; // Ensure we throw for retry mechanism
  }
}

/**
 * Updates an existing user filter
 */
export async function updateUserFilter(id: string, updates: UpdateUserFilterRequest): Promise<UserLeadFilter | null> {
  try {
    // Verify user has access to this filter
    const { data: filterData, error: filterError } = await supabase
      .from('user_lead_filters')
      .select('*')
      .eq('id', id)
      .single();
      
    if (filterError) {
      console.error('Error verifying filter access:', filterError);
      throw filterError;
    }
    
    if (!filterData) {
      const notFoundError = new Error(`Filter with ID ${id} not found`);
      console.error(notFoundError);
      throw notFoundError;
    }
    
    // If this is being set as default, first unset any existing defaults
    if (updates.is_default) {
      await unsetExistingDefaults();
    }
    
    const { data, error } = await supabase
      .from('user_lead_filters')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Error updating user filter:', error);
      throw error;
    }
    
    return data as UserLeadFilter;
  } catch (err) {
    console.error('Error in updateUserFilter:', err);
    throw err; // Ensure we throw for retry mechanism
  }
}

/**
 * Deletes a user filter
 */
export async function deleteUserFilter(id: string): Promise<boolean> {
  try {
    // Verify user has access to this filter
    const { data: filterData, error: filterError } = await supabase
      .from('user_lead_filters')
      .select('*')
      .eq('id', id)
      .single();
      
    if (filterError) {
      console.error('Error verifying filter access:', filterError);
      throw filterError;
    }
    
    if (!filterData) {
      const notFoundError = new Error(`Filter with ID ${id} not found`);
      console.error(notFoundError);
      throw notFoundError;
    }
    
    const { error } = await supabase
      .from('user_lead_filters')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting user filter:', error);
      throw error;
    }
    
    return true;
  } catch (err) {
    console.error('Error in deleteUserFilter:', err);
    throw err; // Ensure we throw for retry mechanism
  }
}

/**
 * Helper to unset any existing default filters
 */
async function unsetExistingDefaults(): Promise<void> {
  const { error } = await supabase
    .from('user_lead_filters')
    .update({ is_default: false })
    .eq('is_default', true);
    
  if (error) {
    console.error('Error unsetting existing default filters:', error);
    throw error;
  }
}

/**
 * Export all user filters API functions
 */
export const userFiltersApi = {
  getUserFilters,
  getDefaultFilter,
  createUserFilter,
  updateUserFilter,
  deleteUserFilter,
};
