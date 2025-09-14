
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { log } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showToast?: boolean;
  trackErrors?: boolean;
}

interface State {
  hasError: boolean;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true, errorId: Date.now().toString() };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { showToast = true, trackErrors = true } = this.props;
    
    log.error('Global error caught:', error, errorInfo);
    
    // Optional: send to external logging service
    if (trackErrors && typeof window !== 'undefined') {
      // Future: Send to Sentry or other service
      console.warn('Error tracking not yet configured');
    }

    // Show toast notification
    if (showToast && typeof window !== 'undefined') {
      // Dynamic import to avoid circular dependencies
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'En feil har oppstått',
          description: 'Noe gikk galt. Prøv å laste siden på nytt.',
          variant: 'destructive',
        });
      }).catch(() => {
        // Fallback if toast system fails
        console.warn('Toast system unavailable');
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, errorId: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-lg w-full text-center space-y-6">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Noe gikk galt</h1>
                <p className="text-muted-foreground">
                  Vi beklager, det oppstod en uventet feil. Prøv å laste siden på nytt eller gå tilbake til forsiden.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Prøv igjen
              </button>
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-md font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Gå til forsiden
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="text-left bg-muted/30 rounded-md p-4 text-sm">
                <summary className="cursor-pointer font-medium text-muted-foreground">
                  Utviklerdetaljer (kun synlig i utviklingsmodus)
                </summary>
                <div className="mt-2 text-xs text-muted-foreground">
                  <p><strong>Error ID:</strong> {this.state.errorId}</p>
                  <p><strong>Tidspunkt:</strong> {new Date().toLocaleString('no-NO')}</p>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
