
import React, { useState } from 'react';
import { Search, CheckSquare, Square } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ModuleAccessItem } from './ModuleAccessItem';
import { Module } from '../../types/types';

interface ModulesListProps {
  modules: Module[];
  userAccess: string[];
  onToggleAccess: (moduleId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export function ModulesList({ modules, userAccess, onToggleAccess, onSelectAll, onClearAll }: ModulesListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredModules = modules.filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (module.description && module.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const allSelected = filteredModules.length > 0 && filteredModules.every(module => userAccess.includes(module.id));

  return (
    <div className="border-t pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Modultilgang</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={allSelected ? onClearAll : onSelectAll}
          >
            {allSelected ? (
              <>
                <Square className="mr-2 h-4 w-4" />
                Fjern alle
              </>
            ) : (
              <>
                <CheckSquare className="mr-2 h-4 w-4" />
                Velg alle
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Søk i moduler..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredModules.length > 0 ? (
          filteredModules.map((module) => (
            <ModuleAccessItem
              key={module.id}
              module={module}
              hasAccess={userAccess.includes(module.id)}
              onToggle={onToggleAccess}
            />
          ))
        ) : (
          <div className="col-span-2 text-center p-4 bg-muted rounded">
            {searchTerm ? 'Ingen moduler funnet' : 'Ingen moduler tilgjengelig'}
          </div>
        )}
      </div>
    </div>
  );
}
