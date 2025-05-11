
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Filter, Plus } from 'lucide-react';
import { UserLeadFilter } from '../../types/user-filters';

interface SavedFiltersProps {
  filters: UserLeadFilter[];
  activeFilter: UserLeadFilter | null;
  onApplyFilter: (filterId: string) => void;
  onCreateNewFilter: () => void;
  canManageFilters?: boolean;
}

export const SavedFilters = ({ 
  filters, 
  activeFilter, 
  onApplyFilter,
  onCreateNewFilter,
  canManageFilters = false
}: SavedFiltersProps) => {
  if (filters.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <span className="text-sm text-muted-foreground flex items-center">
        <Filter size={14} className="mr-1" /> Lagrede filtre:
      </span>
      {filters.map((filter) => (
        <Button
          key={filter.id}
          size="sm"
          variant={activeFilter?.id === filter.id ? "default" : "outline"}
          className="flex items-center gap-1"
          onClick={() => onApplyFilter(filter.id)}
        >
          {filter.filter_name || 'Unnamed'}
          {filter.is_default && (
            <Check size={14} className="ml-1 text-green-500" />
          )}
        </Button>
      ))}
      {canManageFilters && (
        <Button
          size="sm"
          variant="ghost"
          className="flex items-center gap-1"
          onClick={onCreateNewFilter}
        >
          <Plus size={14} />
          Ny
        </Button>
      )}
    </div>
  );
};
