
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { handleReactError } from '@/utils/errorHandling';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    handleReactError(error, errorInfo);
    
    // Display error to user via toast
    toast({
      title: 'En feil har oppstått',
      description: 'Noe gikk galt. Prøv å laste siden på nytt.',
      variant: 'destructive',
    });
  }
  
  public resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md w-full text-center">
            <h2 className="text-xl font-bold text-red-700 mb-4">Oi! Noe gikk galt</h2>
            <p className="text-gray-700 mb-6">
              Det oppsto en feil i applikasjonen. Prøv å laste siden på nytt.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition mr-2"
            >
              Last siden på nytt
            </button>
            <button
              onClick={this.resetError}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              Gå tilbake
            </button>
            
            {/* Show error details in development mode */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 text-left p-4 bg-gray-100 rounded overflow-auto max-h-48">
                <p className="font-mono text-xs text-red-800 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
