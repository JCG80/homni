
import { useState } from 'react';
import { toast } from 'sonner';
import { 
  fetchDetachedBuildings,
  createDetachedBuilding,
  updateDetachedBuilding,
  deleteDetachedBuilding
} from '../api/detachedBuildingsApi';
import { DetachedBuilding, CreateDetachedBuildingInput, UpdateDetachedBuildingInput } from '../types/detached-buildings-types';
import { BuildingFormValues } from '../components/admin/DetachedBuildingFormDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useDetachedBuildings = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentBuilding, setCurrentBuilding] = useState<BuildingFormValues | undefined>();
  const queryClient = useQueryClient();

  // Query to fetch buildings
  const { data: buildings = [], isLoading } = useQuery({
    queryKey: ['detachedBuildings'],
    queryFn: fetchDetachedBuildings
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: (data: CreateDetachedBuildingInput) => createDetachedBuilding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['detachedBuildings'] });
      toast.success('Bygningstype lagt til');
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error adding building:', error);
      toast.error('Kunne ikke legge til bygningstype');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateDetachedBuildingInput) => updateDetachedBuilding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['detachedBuildings'] });
      toast.success('Bygningstype oppdatert');
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error updating building:', error);
      toast.error('Kunne ikke oppdatere bygningstype');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDetachedBuilding(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['detachedBuildings'] });
      toast.success('Bygningstype slettet');
    },
    onError: (error) => {
      console.error('Error deleting building:', error);
      toast.error('Kunne ikke slette bygningstype');
    }
  });

  const handleAddNew = () => {
    setCurrentBuilding(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (building: DetachedBuilding) => {
    setCurrentBuilding({
      id: building.id,
      name: building.name,
      description: building.description,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Er du sikker på at du vil slette denne bygningstypen?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (values: BuildingFormValues) => {
    if (values.id) {
      // Edit existing building
      updateMutation.mutate({
        id: values.id,
        name: values.name,
        description: values.description,
      });
    } else {
      // Add new building
      addMutation.mutate({
        name: values.name,
        description: values.description,
      });
    }
  };

  return {
    buildings,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    searchTerm,
    setSearchTerm,
    currentBuilding,
    handleAddNew,
    handleEdit,
    handleDelete,
    handleSubmit
  };
};
