
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { DetachedBuildingsTable } from '../components/admin/DetachedBuildingsTable';
import { DetachedBuildingFormDialog } from '../components/admin/DetachedBuildingFormDialog';
import { useDetachedBuildings } from '../hooks/useDetachedBuildings';

export const AdminDetachedBuildingsPage = () => {
  const {
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
  } = useDetachedBuildings();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Administrer frittstående bygninger</h1>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> Legg til ny bygningstype
        </Button>
      </div>
      
      <div className="mb-6">
        <Input 
          placeholder="Søk etter bygningstyper..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <DetachedBuildingsTable
        buildings={buildings}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchTerm={searchTerm}
        isLoading={isLoading}
      />

      <DetachedBuildingFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        initialValues={currentBuilding}
        title={currentBuilding?.id ? 'Rediger bygningstype' : 'Legg til ny bygningstype'}
        description="Fyll ut informasjonen under og klikk på lagre for å fortsette."
        submitLabel={currentBuilding?.id ? 'Oppdater' : 'Legg til'}
      />
    </div>
  );
};
