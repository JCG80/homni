
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { DetachedBuilding } from '../../types/detached-buildings-types';

interface DetachedBuildingsTableProps {
  buildings: DetachedBuilding[];
  onEdit: (building: DetachedBuilding) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  isLoading?: boolean;
}

export const DetachedBuildingsTable = ({
  buildings,
  onEdit,
  onDelete,
  searchTerm,
  isLoading = false
}: DetachedBuildingsTableProps) => {
  // Filter buildings based on search term
  const filteredBuildings = buildings.filter(building => 
    building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    building.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse flex flex-col space-y-4 w-full">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>Liste over tilgjengelige bygningstyper for forsikring</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Navn</TableHead>
          <TableHead>Beskrivelse</TableHead>
          <TableHead className="w-[150px]">Handlinger</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredBuildings.map((building) => (
          <TableRow key={building.id}>
            <TableCell className="font-medium">{building.name}</TableCell>
            <TableCell>{building.description}</TableCell>
            <TableCell className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => onEdit(building)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(building.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {filteredBuildings.length === 0 && (
          <TableRow>
            <TableCell colSpan={3} className="text-center">
              {searchTerm 
                ? 'Ingen bygningstyper funnet for søket' 
                : 'Ingen bygningstyper funnet'}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
