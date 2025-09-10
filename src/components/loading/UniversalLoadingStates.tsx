import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  variant?: 'default' | 'compact' | 'inline' | 'fullscreen';
  message?: string;
  showSpinner?: boolean;
}

export const LoadingState = ({ 
  variant = 'default', 
  message = 'Laster...', 
  showSpinner = true 
}: LoadingStateProps) => {
  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-80">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              {showSpinner && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              )}
              <span className="text-sm font-medium">{message}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center space-x-2 py-2">
        {showSpinner && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        )}
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="p-4 text-center">
        {showSpinner && (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
        )}
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          {showSpinner && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          )}
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
};

interface ErrorStateProps {
  message?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: 'default' | 'compact' | 'inline';
  isOffline?: boolean;
}

export const ErrorState = ({ 
  message = 'Noe gikk galt',
  description = 'Prøv igjen senere eller kontakt support hvis problemet vedvarer.',
  onRetry,
  retryLabel = 'Prøv igjen',
  variant = 'default',
  isOffline = false
}: ErrorStateProps) => {
  const iconClass = "h-5 w-5";
  const Icon = isOffline ? WifiOff : AlertCircle;
  const iconColor = isOffline ? "text-orange-500" : "text-red-500";

  if (variant === 'inline') {
    return (
      <div className="flex items-center space-x-2 py-2 text-sm">
        <Icon className={cn("h-4 w-4", iconColor)} />
        <span className="text-muted-foreground">{message}</span>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            <RefreshCw className="h-3 w-3 mr-1" />
            {retryLabel}
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="p-4 text-center space-y-2">
        <Icon className={cn("h-6 w-6 mx-auto", iconColor)} />
        <p className="text-sm font-medium">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {retryLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <Icon className={cn(iconClass, iconColor)} />
          <div>
            <h3 className="font-semibold">{message}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      </CardHeader>
      {onRetry && (
        <CardContent className="pt-0">
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {retryLabel}
          </Button>
        </CardContent>
      )}
    </Card>
  );
};

interface SkeletonGridProps {
  columns?: 1 | 2 | 3 | 4;
  rows?: number;
  className?: string;
  cardSkeleton?: boolean;
}

export const SkeletonGrid = ({ 
  columns = 3, 
  rows = 3, 
  className,
  cardSkeleton = false 
}: SkeletonGridProps) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  if (cardSkeleton) {
    return (
      <div className={cn(`grid gap-4 ${gridCols[columns]}`, className)}>
        {Array.from({ length: rows * columns }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-8 w-24 mt-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(`grid gap-4 ${gridCols[columns]}`, className)}>
      {Array.from({ length: rows * columns }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
};

interface ConnectionStatusProps {
  className?: string;
}

export const ConnectionStatus = ({ className }: ConnectionStatusProps) => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white p-2 text-center text-sm font-medium",
      className
    )}>
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        Du er offline. Noen funksjoner kan være begrenset.
      </div>
    </div>
  );
};