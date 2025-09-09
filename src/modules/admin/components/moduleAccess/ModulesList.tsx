
import React, { useState } from 'react';
import { Search, CheckSquare, Square, ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ModuleAccessItem } from './ModuleAccessItem';
import { Module } from '../../types/types';
import type { CategorizedModules } from '@/modules/system/types/systemTypes';

interface ModulesListProps {
  modules: Module[];
  categorizedModules: CategorizedModules;
  userAccess: string[];
  onToggleAccess: (moduleId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export function ModulesList({ modules, categorizedModules, userAccess, onToggleAccess, onSelectAll, onClearAll }: ModulesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    admin: true, // Admin category open by default
    core: true
  });

  const filteredModules = modules.filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (module.description && module.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const allSelected = filteredModules.length > 0 && filteredModules.every(module => userAccess.includes(module.id));

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'admin': return 'Administrasjon';
      case 'core': return 'Kjernemodeler';
      case 'content': return 'Innhold';
      case 'analytics': return 'Analyser';
      default: return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

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

      <div className="space-y-6">
        {searchTerm ? (
          // Show filtered results when searching
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
                Ingen moduler funnet for "{searchTerm}"
              </div>
            )}
          </div>
        ) : (
          // Show categorized modules when not searching
          Object.entries(categorizedModules).map(([category, categoryModules]) => (
            <Collapsible
              key={category}
              open={openCategories[category]}
              onOpenChange={() => toggleCategory(category)}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <h4 className="text-base font-medium">{getCategoryTitle(category)}</h4>
                  {openCategories[category] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryModules.map((module) => (
                    <ModuleAccessItem
                      key={module.id}
                      module={module}
                      hasAccess={userAccess.includes(module.id)}
                      onToggle={onToggleAccess}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))
        )}
        
        {Object.keys(categorizedModules).length === 0 && (
          <div className="text-center p-4 bg-muted rounded">
            Ingen moduler tilgjengelig
          </div>
        )}
      </div>
    </div>
  );
}
