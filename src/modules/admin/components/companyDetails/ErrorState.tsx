
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-red-500">
      <AlertCircle className="h-10 w-10 mb-2" />
      <p>{message}</p>
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
