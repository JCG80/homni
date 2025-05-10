
import { supabase } from '@/integrations/supabase/client';
import { ProjectDoc } from '../types/docs-types';
import { parseProjectDoc } from '../utils/parseProjectDoc';

/**
 * Load all project docs
 */
export async function loadProjectDocs(): Promise<ProjectDoc[]> {
  const { data, error } = await supabase
    .from('project_docs')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error loading project docs:', error);
    throw error;
  }
  
  return (data || []).map(parseProjectDoc);
}

/**
 * Load a single project doc by id
 */
export async function loadProjectDocById(id: string): Promise<ProjectDoc | null> {
  const { data, error } = await supabase
    .from('project_docs')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error loading project doc:', error);
    throw error;
  }
  
  return data ? parseProjectDoc(data) : null;
}

/**
 * Load project doc by type (e.g. 'project_plan')
 */
export async function loadProjectDocByType(docType: string): Promise<ProjectDoc | null> {
  // Use type-casting to avoid TypeScript errors with the Supabase client
  const { data, error } = await supabase
    .from('project_docs')
    .select('*')
    .eq('doc_type', docType)
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error loading project doc by type:', error);
    throw error;
  }
  
  return data ? parseProjectDoc(data) : null;
}
