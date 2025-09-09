
import { supabase } from '@/lib/supabaseClient';
import { logAdminAction } from '../utils/adminLogger';

/**
 * Fetches all available system modules
 */
export const fetchAvailableModules = async () => {
  try {
    const { data, error } = await supabase
      .from('system_modules')
      .select('*')
      .eq('is_active', true)
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
    // Get user's module access from user_modules table
    const { data: userModules, error: modulesError } = await supabase
      .from('user_modules')
      .select('module_id, is_enabled')
      .eq('user_id', userId)
      .eq('is_enabled', true);
    
    if (modulesError) throw modulesError;
    
    // Get user's internal admin status from user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('metadata')
      .eq('id', userId)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') throw profileError;
    
    const moduleAccess = (userModules || []).map(item => item.module_id);
    const isInternalAdmin = profile?.metadata && 
      typeof profile.metadata === 'object' && 
      profile.metadata !== null &&
      !Array.isArray(profile.metadata) &&
      (profile.metadata as any).internal_admin === true;
    
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
 * Bulk update user module access using database function
 */
export const bulkUpdateUserModuleAccess = async (
  userId: string,
  moduleIds: string[],
  enableAccess: boolean,
  reason?: string
) => {
  try {
    const { error } = await supabase.rpc('bulk_update_user_module_access', {
      target_user_id: userId,
      module_ids: moduleIds,
      enable_access: enableAccess,
      reason
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error in bulk module access update:', error);
    return false;
  }
};

/**
 * Fetch module access audit logs for a user
 */
export const fetchModuleAccessAudit = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('module_access_audit')
      .select(`
        id,
        action,
        reason,
        created_at,
        admin_user_id,
        metadata
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
};

/**
 * Updates a user's module access with audit trail (Legacy - use bulk function instead)
 */
export const updateUserModuleAccess = async (
  userId: string,
  adminId: string,
  moduleAccess: string[],
  isInternalAdmin: boolean,
  reason?: string
) => {
  try {
    // Update internal admin status in user_profiles metadata
    const { data: currentProfile, error: getCurrentError } = await supabase
      .from('user_profiles')
      .select('metadata')
      .eq('id', userId)
      .single();
    
    if (getCurrentError && getCurrentError.code !== 'PGRST116') throw getCurrentError;
    
    const currentMetadata = currentProfile?.metadata && 
      typeof currentProfile.metadata === 'object' && 
      currentProfile.metadata !== null &&
      !Array.isArray(currentProfile.metadata) 
        ? currentProfile.metadata as Record<string, any>
        : {};
    
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        metadata: {
          ...currentMetadata,
          internal_admin: isInternalAdmin
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (profileError) throw profileError;
    
    // Use bulk function for module updates
    const allModules = await fetchAvailableModules();
    const allModuleIds = allModules.map(m => m.id);
    
    // Revoke all modules first
    await bulkUpdateUserModuleAccess(userId, allModuleIds, false, reason);
    
    // Then grant the specified ones
    if (moduleAccess.length > 0) {
      await bulkUpdateUserModuleAccess(userId, moduleAccess, true, reason);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user module access:', error);
    return false;
  }
};
