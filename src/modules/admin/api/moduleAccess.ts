
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
 * Updates a user's module access
 */
export const updateUserModuleAccess = async (
  userId: string,
  adminId: string,
  moduleAccess: string[],
  isInternalAdmin: boolean
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
    
    // Delete existing user_modules for this user
    const { error: deleteError } = await supabase
      .from('user_modules')
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) throw deleteError;
    
    // Insert new module access
    if (moduleAccess.length > 0) {
      const moduleRecords = moduleAccess.map(moduleId => ({
        user_id: userId,
        module_id: moduleId,
        is_enabled: true
      }));
      
      const { error: insertError } = await supabase
        .from('user_modules')
        .insert(moduleRecords);
      
      if (insertError) throw insertError;
    }
    
    // Log the admin action
    await logAdminAction(
      'module_access_update',
      'user',
      userId,
      {
        moduleAccess,
        isInternalAdmin,
        updatedBy: adminId
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error updating user module access:', error);
    return false;
  }
};
