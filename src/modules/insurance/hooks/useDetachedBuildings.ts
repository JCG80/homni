
import { useState } from 'react';
import { toast } from 'sonner';
import { BuildingFormValues } from '../components/admin/DetachedBuildingFormDialog';

// Sample data for demonstration
const SAMPLE_BUILDINGS = [
  { id: '1', name: 'Garasje', description: 'Frittstående garasje' },
  { id: '2', name: 'Uthus', description: 'Standard uthus' },
  { id: '3', name: 'Anneks', description: 'Anneks med overnatting' },
  { id: '4', name: 'Carport', description: 'Åpen carport' },
  { id: '5', name: 'Redskapsbod', description: 'Bod til hageredskaper' },
];

export const useDetachedBuildings = () => {
  const [buildings, setBuildings] = useState(SAMPLE_BUILDINGS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentBuilding, setCurrentBuilding] = useState<BuildingFormValues | undefined>();

  const handleAddNew = () => {
    setCurrentBuilding(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (building: typeof SAMPLE_BUILDINGS[0]) => {
    setCurrentBuilding({
      id: building.id,
      name: building.name,
      description: building.description,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Er du sikker på at du vil slette denne bygningstypen?')) {
      setBuildings(buildings.filter(building => building.id !== id));
      toast.success('Bygningstype slettet');
    }
  };

  const handleSubmit = (values: BuildingFormValues) => {
    if (values.id) {
      // Edit existing building
      setBuildings(buildings.map(building => 
        building.id === values.id 
          ? { ...building, name: values.name, description: values.description }
          : building
      ));
      toast.success('Bygningstype oppdatert');
    } else {
      // Add new building
      const newBuilding = {
        id: Date.now().toString(),
        name: values.name,
        description: values.description,
      };
      setBuildings([...buildings, newBuilding]);
      toast.success('Bygningstype lagt til');
    }
    setIsDialogOpen(false);
  };

  return {
    buildings,
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
