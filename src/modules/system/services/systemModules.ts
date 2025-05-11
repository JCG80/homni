
import { supabase } from '@/integrations/supabase/client';
import { SystemModule } from '../types/systemModules';
import { Json } from '@/integrations/supabase/types';

/**
 * Fetch all system modules
 */
export async function getSystemModules(): Promise<SystemModule[]> {
  try {
    const { data, error } = await supabase
      .from('system_modules' as any)
      .select('*')
      .order('name');
    
    if (error) throw error;
    return (data as unknown as SystemModule[]) || [];
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
      .from('system_modules' as any)
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
 * Create a new system module
 */
export async function createSystemModule(module: Omit<SystemModule, 'id' | 'created_at' | 'updated_at'>): Promise<SystemModule | null> {
  try {
    const { data, error } = await supabase
      .from('system_modules' as any)
      .insert([module])
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as SystemModule;
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
      .from('system_modules' as any)
      .delete()
      .eq('id', moduleId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting system module:', error);
    return false;
  }
}
