
import { supabase } from '@/lib/supabaseClient';
import { ProjectDoc, ProjectDocFormValues } from '../types/docs-types';
import { parseProjectDoc } from '../utils/parseProjectDoc';

/**
 * Save project doc - creates new or updates existing
 */
export async function saveProjectDoc(docData: ProjectDocFormValues): Promise<ProjectDoc | null> {
  try {
    if (docData.id) {
      return updateProjectDoc(docData.id, docData);
    } else {
      return createProjectDoc(docData);
    }
  } catch (error) {
    console.error('Error saving project doc:', error);
    throw error;
  }
}

/**
 * Create new project doc
 */
export async function createProjectDoc(docData: ProjectDocFormValues): Promise<ProjectDoc | null> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  
  // Create a new doc object without the id field
  const { id, ...docDataWithoutId } = docData;
  
  // Use type assertion to bypass TypeScript's type checking
  const { data, error } = await supabase
    .from('project_docs')
    .insert({
      ...docDataWithoutId,
      created_by: userId || null
    } as any)
    .select();
  
  if (error) {
    console.error('Error creating project doc:', error);
    return null;
  }
  
  return data && data.length > 0 ? parseProjectDoc(data[0]) : null;
}

/**
 * Update existing project doc
 */
export async function updateProjectDoc(id: string, docData: Partial<ProjectDocFormValues>): Promise<ProjectDoc | null> {
  // Remove id from the update data
  const { id: _, ...updateData } = docData;
  
  // Use type assertion to bypass TypeScript's type checking
  const { data, error } = await supabase
    .from('project_docs')
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error updating project doc:', error);
    return null;
  }
  
  return data && data.length > 0 ? parseProjectDoc(data[0]) : null;
}
