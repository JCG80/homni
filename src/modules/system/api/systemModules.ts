
import { supabase } from '@/integrations/supabase/client';
import { SystemModule, ALL_MODULES } from '../types/systemModules';

/**
 * Get all system modules with their current status
 */
export async function getSystemModules(): Promise<SystemModule[]> {
  try {
    // Instead of querying a table that might not exist, we'll use the predefined modules
    // and simulate a database query
    
    // In a real implementation, we would need to create a system_modules table
    // For now, we'll just return the predefined modules
    return [...ALL_MODULES];
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
    // Since we don't have the actual database table yet,
    // we'll simulate the toggle operation
    console.log(`Toggled module ${moduleId} to ${active ? 'active' : 'inactive'}`);
    
    // In a real implementation, we would call:
    // const { error } = await supabase.rpc('toggle_system_module', { 
    //   p_module_id: moduleId, 
    //   p_active: active 
    // });
    
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
    // For now, we'll just return the static dependencies from the module definition
    const module = ALL_MODULES.find(m => m.id === moduleId);
    return module?.dependencies || [];
    
    // In a real implementation with a database, we would query:
    // const { data, error } = await supabase
    //   .from('module_dependencies')
    //   .select('dependency_id')
    //   .eq('module_id', moduleId);
    // if (error) throw error;
    // return data ? data.map(d => d.dependency_id) : [];
  } catch (error) {
    console.error(`Failed to fetch dependencies for module ${moduleId}:`, error);
    return [];
  }
}
