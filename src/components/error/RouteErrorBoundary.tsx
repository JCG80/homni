import React from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { logger } from '@/utils/logger';

interface RouteErrorFallbackProps extends FallbackProps {
  routeName?: string;
}

/**
 * Error fallback component for route-specific errors
 */
const RouteErrorFallback: React.FC<RouteErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  routeName = 'ukjent rute'
}) => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const errorMessage = error instanceof Error ? error.message : 'Ukjent feil oppstod';

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

        {import.meta.env.MODE === 'development' && (
          <div className="text-left p-3 bg-muted rounded-md">
            <p className="text-sm font-mono text-destructive break-words">
              {errorMessage}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={resetErrorBoundary}
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
  const handleError = (error: Error, errorInfo: { componentStack: string }) => {
    // Log error with route context
    logger.error(`Route error in ${routeName}`, {
      module: 'routing',
      component: 'RouteErrorBoundary',
      routeName,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });

    // In development, also log to console for debugging
    if (import.meta.env.MODE === 'development') {
      console.group(`🚨 Route Error: ${routeName}`);
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  };

  return (
    <ErrorBoundary
      FallbackComponent={(props) => (
        <RouteErrorFallback {...props} routeName={routeName} />
      )}
      onError={handleError}
      onReset={() => {
        // Clear any error state when resetting
        logger.info(`Route error boundary reset`, {
          module: 'routing',
          component: 'RouteErrorBoundary',
          routeName
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
};