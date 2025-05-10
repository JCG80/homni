
import { supabase } from '@/integrations/supabase/client';
import { SystemModule, ALL_MODULES } from '../types/systemModules';

/**
 * Get all system modules with their current status
 */
export async function getSystemModules(): Promise<SystemModule[]> {
  try {
    const { data, error } = await supabase
      .from('system_modules')
      .select('*');
      
    if (error) throw error;
    
    // Merge database status with predefined module definitions
    return ALL_MODULES.map(module => {
      const dbModule = data?.find(m => m.id === module.id);
      return {
        ...module,
        active: dbModule ? dbModule.active : module.active
      };
    });
  } catch (error) {
    console.error('Failed to fetch system modules:', error);
    // Fall back to predefined modules if we can't fetch from DB
    return [...ALL_MODULES];
  }
}

/**
 * Toggle a system module's active status
 */
export async function toggleSystemModule(moduleId: string, active: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .rpc('toggle_system_module', { 
        p_module_id: moduleId, 
        p_active: active 
      });
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Failed to toggle module ${moduleId}:`, error);
    return false;
  }
}

/**
 * Get dependencies for a specific module
 */
export async function getModuleDependencies(moduleId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('module_dependencies')
      .select('dependency_id')
      .eq('module_id', moduleId);
      
    if (error) throw error;
    return data ? data.map(d => d.dependency_id) : [];
  } catch (error) {
    console.error(`Failed to fetch dependencies for module ${moduleId}:`, error);
    return [];
  }
}
