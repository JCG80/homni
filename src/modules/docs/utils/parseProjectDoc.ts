
import { ProjectDoc } from '../types/docs-types';

/**
 * Parse and validate project doc data from the database
 */
export const parseProjectDoc = (data: any): ProjectDoc => {
  if (!data) throw new Error('No project doc data provided');
  
  return {
    id: data.id || '',
    title: data.title || '',
    content: data.content || '',
    doc_type: data.doc_type || '',
    status: data.status || 'active',
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    created_by: data.created_by || undefined,
  };
};
