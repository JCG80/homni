
import { supabase } from '@/lib/supabaseClient';
import { Content } from '../types/content-types';
import { parseContent } from '../utils/parseContent';
import { logger } from '@/utils/logger';

/**
 * Load all content items
 */
export async function loadAllContent(): Promise<Content[]> {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .order('created_at', { ascending: false }) as any; // Using type assertion until types are updated
  
  if (error) {
    logger.error('Error loading content:', {
      module: 'loadContent',
      action: 'loadAllContent'
    }, error);
    return [];
  }
  
  return (data || []).map(parseContent);
}

/**
 * Load a single content item by ID or slug
 * This is used by the ContentEditor and other components
 */
export async function loadContent(idOrSlug: string): Promise<Content | null> {
  // Try to load by ID first
  const { data: byId, error: errorId } = await supabase
    .from('content')
    .select('*')
    .eq('id', idOrSlug)
    .maybeSingle() as any;
  
  if (byId) {
    return parseContent(byId);
  }
  
  // If not found by ID, try by slug
  const { data: bySlug, error: errorSlug } = await supabase
    .from('content')
    .select('*')
    .eq('slug', idOrSlug)
    .maybeSingle() as any;
  
  if (errorId && errorSlug) {
    logger.error('Error loading content:', {
      module: 'loadContent',
      action: 'loadContent',
      idOrSlug,
      errorId,
      errorSlug
    });
    return null;
  }
  
  return bySlug ? parseContent(bySlug) : null;
}

/**
 * Load a single content item by ID
 */
export async function loadContentById(id: string): Promise<Content | null> {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('id', id)
    .single() as any; // Using type assertion until types are updated
  
  if (error) {
    logger.error('Error loading content by ID:', {
      module: 'loadContent',
      action: 'loadContentById',
      id
    }, error);
    return null;
  }
  
  return parseContent(data);
}

/**
 * Load a single content item by slug
 */
export async function loadContentBySlug(slug: string): Promise<Content[]> {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('slug', slug) as any; // Using type assertion until types are updated
  
  if (error) {
    logger.error('Error loading content by slug:', {
      module: 'loadContent',
      action: 'loadContentBySlug',
      slug
    }, error);
    return [];
  }
  
  return (data || []).map(parseContent);
}

/**
 * Load published content items
 */
export async function loadPublishedContent(type?: string): Promise<Content[]> {
  let query = supabase
    .from('content')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false }) as any; // Using type assertion until types are updated
  
  if (type) {
    query = query.eq('type', type);
  }
  
  const { data, error } = await query;
  
  if (error) {
    logger.error('Error loading published content:', {
      module: 'loadContent',
      action: 'loadPublishedContent',
      type
    }, error);
    return [];
  }
  
  return (data || []).map(parseContent);
}
