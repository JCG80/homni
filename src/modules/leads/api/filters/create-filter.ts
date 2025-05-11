
import { supabase } from '@/integrations/supabase/client';
import { UserLeadFilter, CreateUserFilterRequest } from '../../types/user-filters';
import { unsetExistingDefaults, handleApiError } from '../utils/filter-utils';

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
      return handleApiError('getting current user', userError);
    }
    
    if (!user) {
      const authError = new Error('No authenticated user found');
      return handleApiError('authentication check', authError);
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
      return handleApiError('creating filter', error);
    }
    
    return data as UserLeadFilter;
  } catch (err) {
    return handleApiError('createUserFilter', err);
  }
}
