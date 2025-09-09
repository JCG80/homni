
import React from 'react';
import { Button } from '@/components/ui/button';

interface AccessErrorStateProps {
  error: Error;
  onRetry: () => void;
}

export function AccessErrorState({ error, onRetry }: AccessErrorStateProps) {
  return (
    <div className="p-8 text-center text-red-500">
      <p>Feil ved lasting av tilgangsinnstillinger: {error.message}</p>
      <Button 
        variant="outline" 
        onClick={onRetry} 
        className="mt-4"
      >
        Prøv igjen
      </Button>
    </div>
  );
}
