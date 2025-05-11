
import { supabase } from '@/integrations/supabase/client';
import { SystemModule } from '../types/systemTypes';

/**
 * Fetch all system modules
 */
export async function getSystemModules(): Promise<SystemModule[]> {
  try {
    const { data, error } = await supabase
      .from<SystemModule>('system_modules')
      .select<SystemModule>('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching system modules:', error);
    return [];
  }
}

/**
 * Toggle a system module active status
 */
export async function toggleSystemModule(moduleId: string, isActive: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from<SystemModule>('system_modules')
      .update<SystemModule>({ 
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
      .from<SystemModule>('system_modules')
      .insert<SystemModule>([module])
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
      .from<SystemModule>('system_modules')
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
      .from<SystemModule>('system_modules')
      .select<SystemModule>('id, dependencies');
    
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
