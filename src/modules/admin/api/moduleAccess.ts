
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
    return (data as any[]) || [];
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
      .select('metadata')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    // Extract module_access and internal_admin from metadata
    const metadata = data?.metadata || {};
    const moduleAccess = metadata.module_access || [];
    const isInternalAdmin = metadata.internal_admin || false;
    
    return {
      moduleAccess,
      isInternalAdmin
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
    const { data: currentData } = await supabase
      .from('user_profiles')
      .select('metadata')
      .eq('id', userId)
      .single();
    
    // Get current metadata or initialize as empty object
    const currentMetadata = currentData?.metadata || {};
    
    // Update with new module access settings
    const updatedMetadata = {
      ...currentMetadata,
      module_access: moduleAccess,
      internal_admin: isInternalAdmin
    };
    
    const { error } = await supabase
      .from('user_profiles')
      .update({
        metadata: updatedMetadata
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
