
import { supabase } from '@/integrations/supabase/client';
import { UserLeadFilter, UpdateUserFilterRequest } from '../../types/user-filters';
import { unsetExistingDefaults, handleApiError } from '../utils/filter-utils';

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
      return handleApiError('verifying filter access', filterError);
    }
    
    if (!filterData) {
      const notFoundError = new Error(`Filter with ID ${id} not found`);
      return handleApiError('filter verification', notFoundError);
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
      return handleApiError('updating filter', error);
    }
    
    return data as UserLeadFilter;
  } catch (err) {
    return handleApiError('updateUserFilter', err);
  }
}
