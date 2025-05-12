
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
      <Card className="shadow-sm border-destructive/20">
        <CardHeader className="border-b border-destructive/10">
          <CardTitle className="text-destructive flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            Problem med systemkart
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert variant="destructive" className="mb-6">
            <AlertTitle className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Kunne ikke laste systemmoduler
            </AlertTitle>
            <AlertDescription className="mt-2">
              <div className="bg-destructive/10 p-3 rounded text-sm font-mono whitespace-pre-wrap break-words">{error}</div>
            </AlertDescription>
          </Alert>
          
          {onRetry && (
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                className="border-destructive/50 hover:border-destructive hover:bg-destructive/10 flex items-center gap-2"
                onClick={onRetry}
              >
                <RefreshCw className="h-4 w-4" />
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
