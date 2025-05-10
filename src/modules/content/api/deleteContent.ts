
import { supabase } from '@/integrations/supabase/client';

/**
 * Delete content by ID
 */
export async function deleteContent(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('content')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting content:', error);
    return false;
  }
  
  return true;
}
