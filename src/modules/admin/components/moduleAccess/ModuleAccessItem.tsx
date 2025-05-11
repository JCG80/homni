
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { Module } from '../../types/types';

interface ModuleAccessItemProps {
  module: Module;
  hasAccess: boolean;
  onToggle: (moduleId: string) => void;
}

export function ModuleAccessItem({ module, hasAccess, onToggle }: ModuleAccessItemProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div>
        <h4 className="font-medium">{module.name}</h4>
        <p className="text-sm text-muted-foreground">{module.description}</p>
      </div>
      <Button
        variant={hasAccess ? 'default' : 'outline'}
        onClick={() => onToggle(module.id)}
        className={hasAccess ? 'bg-green-600 hover:bg-green-700' : ''}
      >
        {hasAccess ? (
          <>
            <Check className="mr-2 h-4 w-4" /> Granted
          </>
        ) : (
          <>
            <X className="mr-2 h-4 w-4" /> Denied
          </>
        )}
      </Button>
    </div>
  );
}
