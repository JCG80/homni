
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loadProjectDocs, loadProjectDocById, loadProjectDocByType } from '../api/loadProjectDocs';
import { saveProjectDoc } from '../api/saveProjectDoc';
import { ProjectDocFormValues } from '../types/docs-types';
import { toast } from '@/components/ui/use-toast';

export function useProjectDocs() {
  const queryClient = useQueryClient();
  
  const { data: projectDocs, isLoading: isLoadingDocs } = useQuery({
    queryKey: ['projectDocs'],
    queryFn: loadProjectDocs
  });
  
  const { mutate: saveDoc, isPending: isSaving } = useMutation({
    mutationFn: (docData: ProjectDocFormValues) => saveProjectDoc(docData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectDocs'] });
      toast({ 
        title: 'Dokument lagret', 
        description: 'Prosjektdokumentet ble lagret' 
      });
    },
    onError: (error) => {
      console.error('Error saving project doc:', error);
      toast({ 
        title: 'Feil ved lagring', 
        description: 'Kunne ikke lagre prosjektdokumentet', 
        variant: 'destructive' 
      });
    }
  });
  
  const getDocById = async (id: string) => {
    return await loadProjectDocById(id);
  };
  
  const getDocByType = async (docType: string) => {
    return await loadProjectDocByType(docType);
  };
  
  return {
    projectDocs,
    isLoadingDocs,
    saveDoc,
    isSaving,
    getDocById,
    getDocByType
  };
}
