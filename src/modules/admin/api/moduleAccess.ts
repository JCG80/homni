
import { supabase } from '@/integrations/supabase/client';
import { logAdminAction } from '../utils/adminLogger';

/**
 * Fetches all available system modules
 */
export const fetchAvailableModules = async () => {
  try {
    const { data, error } = await supabase
      .from('system_modules')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching available modules:', error);
    return [];
  }
};

/**
 * Fetches module access for a specific user
 */
export const fetchUserModuleAccess = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('module_access, internal_admin')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return {
      moduleAccess: data?.module_access || [],
      isInternalAdmin: data?.internal_admin || false
    };
  } catch (error) {
    console.error('Error fetching user module access:', error);
    return { moduleAccess: [], isInternalAdmin: false };
  }
};

/**
 * Updates a user's module access
 */
export const updateUserModuleAccess = async (
  userId: string,
  adminId: string,
  moduleAccess: string[],
  isInternalAdmin: boolean
) => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        module_access: moduleAccess,
        internal_admin: isInternalAdmin
      })
      .eq('id', userId);
    
    if (error) throw error;
    
    // Log the admin action
    await logAdminAction(
      adminId,
      'update',
      'user',
      userId,
      {
        action: 'module_access_update',
        moduleAccess,
        isInternalAdmin
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error updating user module access:', error);
    return false;
  }
};
