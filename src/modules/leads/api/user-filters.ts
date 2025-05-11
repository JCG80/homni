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
    return [];
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
    return null;
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
  // If this is a default filter, first unset any existing default
  if (filter.is_default) {
    await unsetExistingDefaults();
  }
  
  const { data, error } = await supabase
    .from('user_lead_filters')
    .insert([filter])
    .select()
    .maybeSingle();
  
  if (error) {
    console.error('Error creating user filter:', error);
    toast({
      title: 'Error creating filter',
      description: error.message,
      variant: 'destructive',
    });
    return null;
  }
  
  return data as UserLeadFilter;
}

/**
 * Updates an existing user filter
 */
export async function updateUserFilter(id: string, updates: UpdateUserFilterRequest): Promise<UserLeadFilter | null> {
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
    toast({
      title: 'Error updating filter',
      description: error.message,
      variant: 'destructive',
    });
    return null;
  }
  
  return data as UserLeadFilter;
}

/**
 * Deletes a user filter
 */
export async function deleteUserFilter(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_lead_filters')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting user filter:', error);
    toast({
      title: 'Error deleting filter',
      description: error.message,
      variant: 'destructive',
    });
    return false;
  }
  
  return true;
}

/**
 * Helper to unset any existing default filters
 */
async function unsetExistingDefaults(): Promise<void> {
  await supabase
    .from('user_lead_filters')
    .update({ is_default: false })
    .eq('is_default', true);
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
