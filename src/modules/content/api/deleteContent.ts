
import { supabase } from '@/lib/supabaseClient';

/**
 * Delete content by ID
 */
export async function deleteContent(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('content')
    .delete()
    .eq('id', id) as any; // Using type assertion to bypass TypeScript errors until types are updated
  
  if (error) {
    console.error('Error deleting content:', error);
    return false;
  }
  
  return true;
}
