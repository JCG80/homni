
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface AdminStatusToggleProps {
  isInternalAdmin: boolean;
  onToggle: () => void;
}

export function AdminStatusToggle({ isInternalAdmin, onToggle }: AdminStatusToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-medium">Intern admin-status</h3>
        <p className="text-sm text-muted-foreground">
          Gi interne administratorrettigheter til denne brukeren
        </p>
      </div>
      <Button
        variant={isInternalAdmin ? 'default' : 'outline'}
        onClick={onToggle}
        className={isInternalAdmin ? 'bg-green-600 hover:bg-green-700' : ''}
      >
        {isInternalAdmin ? (
          <>
            <Check className="mr-2 h-4 w-4" /> Aktivert
          </>
        ) : (
          <>
            <X className="mr-2 h-4 w-4" /> Deaktivert
          </>
        )}
      </Button>
    </div>
  );
}
