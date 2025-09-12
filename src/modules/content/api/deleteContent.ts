
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';

/**
 * Delete content by ID
 */
export async function deleteContent(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('content')
    .delete()
    .eq('id', id) as any; // Using type assertion to bypass TypeScript errors until types are updated
  
  if (error) {
    logger.error('Error deleting content', {
      module: 'deleteContent',
      action: 'deleteContent',
      contentId: id
    }, error);
    return false;
  }
  
  return true;
}
