
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface SystemMapErrorProps {
  error: string;
  onRetry?: () => void;
}

export const SystemMapError = ({ error, onRetry }: SystemMapErrorProps) => {
  return (
    <div className="container mx-auto p-6">
      <Alert variant="destructive" className="bg-red-50 border-red-200">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="text-red-800 font-medium">Feil ved lasting av systemkart</AlertTitle>
        <AlertDescription className="text-red-700">
          {error}
        </AlertDescription>
        {onRetry && (
          <Button 
            variant="outline" 
            className="mt-4 bg-white hover:bg-red-50" 
            onClick={onRetry}
          >
            Prøv igjen
          </Button>
        )}
      </Alert>
    </div>
  );
};
