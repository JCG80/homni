
import { supabase } from '@/lib/supabaseClient';
import { Content, ContentFormValues } from '../types/content-types';
import { parseContent } from '../utils/parseContent';
import { logger } from '@/utils/logger';

/**
 * Save content - creates new or updates existing
 */
export async function saveContent(contentData: ContentFormValues): Promise<Content | null> {
  try {
    if (contentData.id) {
      return updateContent(contentData.id, contentData);
    } else {
      return createContent(contentData);
    }
  } catch (error) {
    logger.error('Error saving content:', {
      module: 'saveContent',
      action: 'saveContent',
      contentId: contentData.id
    }, error as Error);
    throw error;
  }
}

/**
 * Create new content
 */
export async function createContent(contentData: ContentFormValues): Promise<Content | null> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  
  if (!userId) {
    logger.error('No authenticated user found', {
      module: 'saveContent',
      action: 'createContent'
    });
    return null;
  }
  
  // Create a new content object without the id field
  const { id, ...contentDataWithoutId } = contentData;
  
  const { data, error } = await supabase
    .from('content')
    .insert({
      ...contentDataWithoutId,
      created_by: userId
    })
    .select();
  
  if (error) {
    logger.error('Error creating content:', {
      module: 'saveContent',
      action: 'createContent',
      title: contentDataWithoutId.title
    }, error);
    return null;
  }
  
  return data && data.length > 0 ? parseContent(data[0]) : null;
}

/**
 * Update existing content
 */
export async function updateContent(id: string, contentData: Partial<ContentFormValues>): Promise<Content | null> {
  // Remove id from the update data
  const { id: _, ...updateData } = contentData;
  
  const { data, error } = await supabase
    .from('content')
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select();
  
  if (error) {
    logger.error('Error updating content:', {
      module: 'saveContent',
      action: 'updateContent',
      contentId: id
    }, error);
    return null;
  }
  
  return data && data.length > 0 ? parseContent(data[0]) : null;
}
