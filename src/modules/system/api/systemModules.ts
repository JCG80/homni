
import { supabase } from '@/integrations/supabase/client';
import { SystemModule } from '../types/systemModules';

/**
 * Fetch all system modules
 */
export async function getSystemModules(): Promise<SystemModule[]> {
  try {
    const { data, error } = await supabase
      .from('system_modules')
      .select('*')
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
      .from('system_modules')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', moduleId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error toggling system module:', error);
    return false;
  }
}

/**
 * Get module dependencies 
 */
export async function getModuleDependencies(): Promise<Record<string, string[]>> {
  try {
    // In a real implementation, this would fetch actual dependency data
    // For now, returning an empty object as per the mock implementation
    return {};
  } catch (error) {
    console.error('Error fetching module dependencies:', error);
    return {};
  }
}
