
import { supabase } from '@/integrations/supabase/client';
import { SystemModule, UserModuleAccess } from '../types/systemTypes';

/**
 * Fetch all system modules ordered by category and sort order
 */
export async function getSystemModules(): Promise<SystemModule[]> {
  try {
    const { data, error } = await supabase
      .from('system_modules')
      .select('*')
      .order('category, sort_order, name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching system modules:', error);
    return [];
  }
}

/**
 * Get user's modules with access status organized by category
 */
export async function getUserModulesWithCategory(userId?: string): Promise<UserModuleAccess[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_user_modules_with_category', userId ? { user_id: userId } : {});
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user modules with category:', error);
    return [];
  }
}

/**
 * Bulk check module access for multiple modules
 */
export async function bulkCheckModuleAccess(moduleNames: string[], userId?: string): Promise<Record<string, boolean>> {
  try {
    const { data, error } = await supabase
      .rpc('bulk_check_module_access', { 
        module_names: moduleNames,
        ...(userId && { user_id: userId })
      });
    
    if (error) throw error;
    
    const accessMap: Record<string, boolean> = {};
    (data || []).forEach((item: any) => {
      accessMap[item.module_name] = item.has_access;
    });
    
    return accessMap;
  } catch (error) {
    console.error('Error bulk checking module access:', error);
    return {};
  }
}

/**
 * Toggle a system module active status
 */
export async function toggleSystemModule(moduleId: string, isActive: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('system_modules')
      .update({ 
        is_active: isActive, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', moduleId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error toggling system module:', error);
    return false;
  }
}

/**
 * Create a new system module
 */
export async function createSystemModule(module: Omit<SystemModule, 'id' | 'created_at' | 'updated_at'>): Promise<SystemModule | null> {
  try {
    const { data, error } = await supabase
      .from('system_modules')
      .insert([module])
      .select();
    
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error creating system module:', error);
    return null;
  }
}

/**
 * Delete a system module
 */
export async function deleteSystemModule(moduleId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('system_modules')
      .delete()
      .eq('id', moduleId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting system module:', error);
    return false;
  }
}

/**
 * Get module dependencies
 */
export async function getModuleDependencies(): Promise<Record<string, string[]>> {
  try {
    const { data, error } = await supabase
      .from('system_modules')
      .select('id, dependencies');
    
    if (error) throw error;
    
    const dependencyMap: Record<string, string[]> = {};
    (data || []).forEach((module) => {
      dependencyMap[module.id] = module.dependencies || [];
    });
    
    return dependencyMap;
  } catch (error) {
    console.error('Error getting module dependencies:', error);
    return {};
  }
}
