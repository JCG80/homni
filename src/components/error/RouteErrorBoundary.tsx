import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface RouteErrorBoundaryProps {
  children: React.ReactNode;
}

interface RouteErrorState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class RouteErrorBoundary extends React.Component<RouteErrorBoundaryProps, RouteErrorState> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): RouteErrorState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Route Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <RouteErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

function RouteErrorFallback({ error }: { error?: Error }) {
  const location = useLocation();
  
  const handleReload = () => {
    window.location.reload();
  };

  const handleRetry = () => {
    window.history.back();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="space-y-6 max-w-md">
        <div className="flex justify-center">
          <AlertTriangle className="h-16 w-16 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Noe gikk galt</h1>
          <p className="text-muted-foreground">
            Det oppstod en feil ved lasting av denne siden.
          </p>
        </div>

        {error && import.meta.env.DEV && (
          <div className="bg-muted p-4 rounded-lg text-left">
            <p className="text-sm font-mono text-destructive">{error.message}</p>
            <p className="text-xs text-muted-foreground mt-1">Rute: {location.pathname}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleReload} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Last på nytt
          </Button>
          
          <Button variant="outline" onClick={handleRetry} className="flex items-center gap-2">
            Gå tilbake
          </Button>
          
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Hjem
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}