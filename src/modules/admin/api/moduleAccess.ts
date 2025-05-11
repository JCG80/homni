
import { supabase } from '@/integrations/supabase/client';
import { logAdminAction } from '../utils/adminLogger';
import { Json } from '@/integrations/supabase/types';

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
    // First, check if the user has internal_admin flag in the module_access table
    const { data: moduleAccessData, error: moduleAccessError } = await supabase
      .from('module_access')
      .select('system_module_id, internal_admin')
      .eq('user_id', userId);
    
    if (moduleAccessError) throw moduleAccessError;
    
    // Get all module IDs that the user has access to
    const moduleAccess = (moduleAccessData || []).map(item => item.system_module_id);
    
    // Check if any record has internal_admin = true
    const isInternalAdmin = (moduleAccessData || []).some(item => item.internal_admin === true);
    
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
    // First delete all existing module access for this user
    const { error: deleteError } = await supabase
      .from('module_access')
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) throw deleteError;
    
    // Then insert new module access
    if (moduleAccess.length > 0) {
      const moduleAccessRecords = moduleAccess.map(moduleId => ({
        user_id: userId,
        system_module_id: moduleId,
        internal_admin: isInternalAdmin
      }));
      
      const { error: insertError } = await supabase
        .from('module_access')
        .insert(moduleAccessRecords);
      
      if (insertError) throw insertError;
    } 
    // If isInternalAdmin is true but no modules are selected, add a special record
    else if (isInternalAdmin) {
      // Get the first available module to create at least one record with internal_admin=true
      const { data: firstModule } = await supabase
        .from('system_modules')
        .select('id')
        .limit(1)
        .single();
      
      if (firstModule) {
        const { error: insertAdminError } = await supabase
          .from('module_access')
          .insert({
            user_id: userId,
            system_module_id: firstModule.id,
            internal_admin: true
          });
        
        if (insertAdminError) throw insertAdminError;
      }
    }
    
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
