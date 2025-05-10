
import { supabase } from '@/integrations/supabase/client';
import { Content, ContentFormValues } from '../types/content-types';
import { parseContent } from '../utils/parseContent';

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
    console.error('Error saving content:', error);
    throw error;
  }
}

/**
 * Create new content
 */
async function createContent(contentData: ContentFormValues): Promise<Content | null> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  
  if (!userId) {
    console.error('No authenticated user found');
    return null;
  }
  
  const { data, error } = await supabase
    .from('content')
    .insert({
      ...contentData,
      created_by: userId
    })
    .select() as any; // Using type assertion until types are updated
  
  if (error) {
    console.error('Error creating content:', error);
    return null;
  }
  
  return parseContent(data[0]);
}

/**
 * Update existing content
 */
async function updateContent(id: string, contentData: Partial<ContentFormValues>): Promise<Content | null> {
  const { data, error } = await supabase
    .from('content')
    .update({
      ...contentData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select() as any; // Using type assertion until types are updated
  
  if (error) {
    console.error('Error updating content:', error);
    return null;
  }
  
  return data && data.length > 0 ? parseContent(data[0]) : null;
}
