
import { supabase } from '@/lib/supabaseClient';
import { ProjectDoc } from '../types/docs-types';
import { parseProjectDoc } from '../utils/parseProjectDoc';
import { logger } from '@/utils/logger';

/**
 * Load all project docs
 */
export async function loadProjectDocs(): Promise<ProjectDoc[]> {
  const { data, error } = await supabase
    .from('project_docs')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    logger.error('Error loading project docs', {
      module: 'loadProjectDocs',
      action: 'loadProjectDocs'
    }, error);
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
    logger.error('Error loading project doc', {
      module: 'loadProjectDocs',
      action: 'loadProjectDocById',
      docId: id
    }, error);
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
    logger.error('Error loading project doc by type', {
      module: 'loadProjectDocs',
      action: 'loadProjectDocByType',
      docType
    }, error);
    throw error;
  }
  
  return data ? parseProjectDoc(data) : null;
}
