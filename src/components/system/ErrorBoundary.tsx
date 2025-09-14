import React from 'react';
import { getEnv } from '@/utils/env';
import { log } from '@/utils/logger';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    log.error('[ErrorBoundary]', error, info);
    // Optionally forward to Sentry via setLogSink() later
  }

  render() {
    const env = getEnv();
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md mx-auto p-6 text-center space-y-4">
            <div className="text-destructive text-4xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-foreground">Noe gikk galt</h2>
            <p className="text-muted-foreground">
              Beklager, det oppstod en uventet feil. Prøv å laste siden på nytt.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Last siden på nytt
            </button>
            {env.DEV && (
              <details className="text-left mt-4 p-4 bg-muted rounded-md">
                <summary className="cursor-pointer font-medium text-muted-foreground">
                  Feildetaljer (kun i utvikling)
                </summary>
                <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}