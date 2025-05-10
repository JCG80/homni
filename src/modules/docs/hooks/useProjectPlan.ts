
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { loadProjectDocByType } from '../api/loadProjectDocs';
import { saveProjectDoc } from '../api/saveProjectDoc';
import { ProjectDoc } from '../types/docs-types';

export function useProjectPlan() {
  const [isEditing, setIsEditing] = useState(false);
  
  const { 
    data: projectPlan, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['projectPlan'],
    queryFn: () => loadProjectDocByType('project_plan')
  });
  
  const updateProjectPlan = async (content: string) => {
    if (!projectPlan) return null;
    
    try {
      const updated = await saveProjectDoc({
        id: projectPlan.id,
        title: projectPlan.title,
        content,
        doc_type: projectPlan.doc_type,
        status: projectPlan.status as 'active' | 'archived'
      });
      
      await refetch();
      return updated;
    } catch (error) {
      console.error('Error updating project plan:', error);
      return null;
    }
  };
  
  return {
    projectPlan,
    isLoading,
    error,
    isEditing,
    setIsEditing,
    updateProjectPlan,
    refetch
  };
}
