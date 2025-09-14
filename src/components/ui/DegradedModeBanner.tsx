import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/modules/auth/context';

export function DegradedModeBanner() {
  const { isGuest } = useAuth();
  
  if (!isGuest) return null;
  
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-amber-700">
            <strong>Begrenset modus:</strong> Noen funksjoner er ikke tilgjengelige uten pålogging.
          </p>
        </div>
      </div>
    </div>
  );
}