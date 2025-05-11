
import React from 'react';
import { ModuleAccessItem } from './ModuleAccessItem';
import { Module } from '../../types/types';

interface ModulesListProps {
  modules: Module[];
  userAccess: string[];
  onToggleAccess: (moduleId: string) => void;
}

export function ModulesList({ modules, userAccess, onToggleAccess }: ModulesListProps) {
  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-medium mb-4">Module Access</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.length > 0 ? (
          modules.map((module) => (
            <ModuleAccessItem
              key={module.id}
              module={module}
              hasAccess={userAccess.includes(module.id)}
              onToggle={onToggleAccess}
            />
          ))
        ) : (
          <div className="col-span-2 text-center p-4 bg-gray-50 rounded">
            No modules available
          </div>
        )}
      </div>
    </div>
  );
}
