
import { supabase } from '@/integrations/supabase/client';
import { handleApiError } from '../utils/filter-utils';

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
      return handleApiError('verifying filter access', filterError);
    }
    
    if (!filterData) {
      const notFoundError = new Error(`Filter with ID ${id} not found`);
      return handleApiError('filter verification', notFoundError);
    }
    
    const { error } = await supabase
      .from('user_lead_filters')
      .delete()
      .eq('id', id);
    
    if (error) {
      return handleApiError('deleting filter', error);
    }
    
    return true;
  } catch (err) {
    return handleApiError('deleteUserFilter', err);
    return false;
  }
}
