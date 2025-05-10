
import { supabase } from '@/integrations/supabase/client';
import { Content } from '../types/content-types';
import { parseContent } from '../utils/parseContent';

/**
 * Load all content items
 */
export async function loadAllContent(): Promise<Content[]> {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error loading content:', error);
    return [];
  }
  
  return (data || []).map(parseContent);
}

/**
 * Load a single content item by ID
 */
export async function loadContentById(id: string): Promise<Content | null> {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error loading content by ID:', error);
    return null;
  }
  
  return parseContent(data);
}

/**
 * Load a single content item by slug
 */
export async function loadContentBySlug(slug: string): Promise<Content | null> {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error('Error loading content by slug:', error);
    return null;
  }
  
  return parseContent(data);
}

/**
 * Load published content items
 */
export async function loadPublishedContent(type?: string): Promise<Content[]> {
  let query = supabase
    .from('content')
    .select('*')
    .eq('published', true)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false });
  
  if (type) {
    query = query.eq('type', type);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error loading published content:', error);
    return [];
  }
  
  return (data || []).map(parseContent);
}
