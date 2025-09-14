import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { log } from '@/utils/logger';

interface RouteErrorFallbackProps {
  routeName?: string;
}

/**
 * Error fallback component for route-specific errors
 */
const RouteErrorFallback: React.FC<RouteErrorFallbackProps> = ({
  routeName = 'ukjent rute'
}) => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md p-6 text-center space-y-4">
        <div className="flex justify-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Noe gikk galt
          </h2>
          <p className="text-muted-foreground">
            Det oppstod en feil i {routeName}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleReload}
            className="flex-1"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Prøv igjen
          </Button>
          <Button 
            onClick={handleGoHome}
            className="flex-1"
          >
            <Home className="mr-2 h-4 w-4" />
            Til forsiden
          </Button>
        </div>
      </Card>
    </div>
  );
};

interface RouteErrorBoundaryProps {
  children: React.ReactNode;
  routeName?: string;
}

/**
 * Route-specific error boundary with enhanced error handling
 */
export const RouteErrorBoundary: React.FC<RouteErrorBoundaryProps> = ({
  children,
  routeName
}) => {
  const fallback = <RouteErrorFallback routeName={routeName} />;

  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
};