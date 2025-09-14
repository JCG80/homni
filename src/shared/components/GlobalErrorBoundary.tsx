import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/utils/logger';
import { toast } from '@/hooks/use-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showToast?: boolean;
  trackErrors?: boolean;
}

interface State {
  hasError: boolean;
  errorId?: string;
  retryCount: number;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  
  state: State = { 
    hasError: false, 
    retryCount: 0 
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { showToast = true, trackErrors = true } = this.props;
    const errorId = this.state.errorId;
    
    // Enhanced logging with context
    logger.error('Global error boundary triggered:', {
      errorId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });

    // External error tracking (ready for Sentry)
    if (trackErrors && typeof window !== 'undefined') {
      // Future: Send to external service
      if (import.meta.env.DEV) {
        console.warn('Error tracking ready for external service integration');
      }
    }

    // Show user-friendly toast notification
    if (showToast && typeof window !== 'undefined') {
      toast({
        title: 'En uventet feil oppstod',
        description: 'Vi arbeider med å løse problemet. Prøv å last siden på nytt.',
        variant: 'destructive',
      });
    }
  }

  handleReset = () => {
    this.setState(prevState => ({ 
      hasError: false, 
      errorId: undefined,
      retryCount: prevState.retryCount + 1 
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback takes precedence
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Lovable-branded error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-lg w-full">
            {/* Error Card */}
            <div className="bg-gradient-to-br from-lovable-red-50 to-lovable-red-100 dark:from-lovable-red-900/20 dark:to-lovable-red-800/20 rounded-2xl p-8 shadow-lg border border-lovable-red-200 dark:border-lovable-red-800/50">
              
              {/* Lovable Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-lovable-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-2xl">💝</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-lovable-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white">!</span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-lovable-red-700 dark:text-lovable-red-300">
                  Oops! 😬
                </h1>
                <p className="text-lovable-red-600 dark:text-lovable-red-400 leading-relaxed">
                  Vi støtte på en uventet feil. Ikke bekymre deg - vi logger alt og arbeider 
                  kontinuerlig med å forbedre opplevelsen din.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  onClick={this.handleReset}
                  disabled={this.state.retryCount >= this.maxRetries}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-lovable-red-500 hover:bg-lovable-red-600 disabled:bg-lovable-red-300 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {this.state.retryCount >= this.maxRetries ? 'Max forsøk nådd' : 'Prøv igjen'}
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-lovable-blue-500 hover:bg-lovable-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Last siden på nytt
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Gå til forsiden
                </button>
              </div>

              {/* Developer Details */}
              {import.meta.env.DEV && (
                <details className="mt-6 text-left bg-muted/30 rounded-lg p-4 text-sm">
                  <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground transition-colors">
                    🛠️ Utviklerdetaljer (kun synlig i utviklingsmodus)
                  </summary>
                  <div className="mt-3 space-y-2 text-xs font-mono text-muted-foreground">
                    <div className="grid grid-cols-1 gap-1">
                      <p><span className="font-semibold">Error ID:</span> {this.state.errorId}</p>
                      <p><span className="font-semibold">Tidspunkt:</span> {new Date().toLocaleString('no-NO')}</p>
                      <p><span className="font-semibold">Forsøk:</span> {this.state.retryCount}/{this.maxRetries}</p>
                      <p><span className="font-semibold">URL:</span> {window.location.href}</p>
                    </div>
                  </div>
                </details>
              )}

              {/* Lovable Attribution */}
              <div className="mt-6 pt-4 border-t border-lovable-red-200 dark:border-lovable-red-800/50 text-center">
                <p className="text-xs text-muted-foreground">
                  Bygget med ❤️ av{' '}
                  <a 
                    href="https://lovable.dev" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-lovable-red-500 hover:text-lovable-red-600 font-medium transition-colors"
                  >
                    Lovable
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}