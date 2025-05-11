
import { supabase } from '@/integrations/supabase/client';
import { UserLeadFilter } from '../../types/user-filters';
import { toast } from '@/hooks/use-toast';
import { handleApiError } from '../utils/filter-utils';

/**
 * Fetches all filters for the current user
 */
export async function getUserFilters(): Promise<UserLeadFilter[]> {
  try {
    const { data, error } = await supabase
      .from('user_lead_filters')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) {
      return handleApiError('fetching filters', error);
    }
    
    return data as UserLeadFilter[];
  } catch (err) {
    return handleApiError('getUserFilters', err);
  }
}

/**
 * Fetches the default filter for the current user, or creates one if it doesn't exist
 */
export async function getDefaultFilter(): Promise<UserLeadFilter | null> {
  try {
    // First try to get existing default filter
    const { data, error } = await supabase
      .from('user_lead_filters')
      .select('*')
      .eq('is_default', true)
      .maybeSingle();
    
    if (error) {
      return handleApiError('fetching default filter', error);
    }
    
    // If we found a default filter, return it
    if (data) {
      return data as UserLeadFilter;
    }
    
    // No default filter found, handle in the caller
    return null;
  } catch (err) {
    return handleApiError('getDefaultFilter', err);
  }
}
