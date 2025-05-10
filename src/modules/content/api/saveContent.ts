
import { supabase } from '@/integrations/supabase/client';
import { Content, ContentFormValues } from '../types/content-types';
import { parseContent } from '../utils/parseContent';

/**
 * Create new content
 */
export async function createContent(contentData: ContentFormValues): Promise<Content | null> {
  const userId = supabase.auth.getUser().then(res => res.data.user?.id);
  
  if (!userId) {
    console.error('No authenticated user found');
    return null;
  }
  
  const { data, error } = await supabase
    .from('content')
    .insert({
      ...contentData,
      created_by: await userId,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating content:', error);
    return null;
  }
  
  return parseContent(data);
}

/**
 * Update existing content
 */
export async function updateContent(id: string, contentData: Partial<ContentFormValues>): Promise<Content | null> {
  const { data, error } = await supabase
    .from('content')
    .update({
      ...contentData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating content:', error);
    return null;
  }
  
  return parseContent(data);
}
