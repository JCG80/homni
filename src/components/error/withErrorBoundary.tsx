import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { log } from '@/utils/logger';

// HOC for adding debug information in development
export function withDebugInfo<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  return function WrappedComponent(props: P) {
    const debugFallback = (
      <div className="p-6 text-center border border-destructive rounded-lg">
        <h1 className="text-xl font-bold text-destructive mb-2">Noe gikk galt</h1>
        {componentName && (
          <p className="text-sm text-muted-foreground mb-4">
            Feil i {componentName}
          </p>
        )}
        <p>Vennligst prøv å laste siden på nytt.</p>
      </div>
    );

    return (
      <ErrorBoundary fallback={debugFallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// HOC for production error tracking with toast notifications
export function withErrorLogging<P extends object>(
  Component: React.ComponentType<P>,
  options?: { showToast?: boolean; trackErrors?: boolean }
) {
  const { showToast = true, trackErrors = true } = options || {};

  return function WrappedComponent(props: P) {
    class ErrorTracker extends React.Component<P, { hasError: boolean }> {
      state = { hasError: false };

      static getDerivedStateFromError(): { hasError: boolean } {
        return { hasError: true };
      }

      componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        log.error('Component error:', error, errorInfo);
        
        if (trackErrors) {
          // Future: Send to external service like Sentry
        }

        if (showToast && typeof window !== 'undefined') {
          // Dynamic import to avoid circular dependencies
          import('@/hooks/use-toast').then(({ toast }) => {
            toast({
              title: 'En feil har oppstått',
              description: 'Noe gikk galt. Prøv å laste siden på nytt.',
              variant: 'destructive',
            });
          });
        }
      }

      render() {
        if (this.state.hasError) {
          return (
            <div className="p-6 text-center">
              <h1 className="text-xl font-bold text-destructive">Noe gikk galt</h1>
              <p>Vennligst prøv å laste siden på nytt.</p>
            </div>
          );
        }

        return <Component {...this.props} />;
      }
    }

    return <ErrorTracker {...props} />;
  };
}