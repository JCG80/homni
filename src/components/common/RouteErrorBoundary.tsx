import React, { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface RouteErrorBoundaryProps {
  children: ReactNode;
  routeName: string;
}

/**
 * Route-specific error boundary with enhanced error handling
 * Provides route context for better debugging and user experience
 */
export const RouteErrorBoundary = ({ children, routeName }: RouteErrorBoundaryProps) => {
  const fallback = (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="bg-background border border-border rounded-lg p-8 max-w-md w-full text-center shadow-lg">
        <div className="mb-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Feil på {routeName}</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Vi har problemer med å laste denne siden. Prøv å gå tilbake eller last siden på nytt.
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.history.back()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition"
          >
            Gå tilbake
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 py-2 rounded-md transition"
          >
            Last siden på nytt
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
};