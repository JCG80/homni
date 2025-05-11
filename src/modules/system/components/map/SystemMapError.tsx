
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface SystemMapErrorProps {
  error: string;
  onRetry?: () => void;
}

export const SystemMapError = ({ error, onRetry }: SystemMapErrorProps) => {
  return (
    <div className="container mx-auto p-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            Problem med systemkart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertDescription className="text-red-700 text-sm">
              <p className="font-medium mb-2">Kunne ikke laste systemmoduler:</p>
              <p className="bg-red-100 p-2 rounded text-sm font-mono">{error}</p>
            </AlertDescription>
          </Alert>
          
          {onRetry && (
            <div className="mt-6 flex justify-center">
              <Button 
                variant="outline" 
                className="bg-white hover:bg-red-50 border-red-200" 
                onClick={onRetry}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Prøv igjen
              </Button>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-amber-800 text-sm">
              Dette kan være forårsaket av en midlertidig feil i systemet eller manglende internettforbindelse. 
              Vennligst prøv igjen senere eller kontakt support hvis problemet vedvarer.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
