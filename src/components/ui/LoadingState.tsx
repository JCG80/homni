import React from 'react';
import { Loader2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton' | 'dots' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  timeout?: number;
  showTimeout?: boolean;
  className?: string;
}

/**
 * Enhanced loading state component with multiple variants
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  variant = 'spinner',
  size = 'md',
  message,
  timeout = 10000,
  showTimeout = false,
  className
}) => {
  const [hasTimedOut, setHasTimedOut] = React.useState(false);

  React.useEffect(() => {
    if (showTimeout && timeout > 0) {
      const timer = setTimeout(() => {
        setHasTimedOut(true);
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [timeout, showTimeout]);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const containerClasses = {
    sm: 'gap-2 text-sm',
    md: 'gap-3 text-base',
    lg: 'gap-4 text-lg'
  };

  if (hasTimedOut) {
    return (
      <div className={cn(
        'flex items-center justify-center',
        containerClasses[size],
        className
      )}>
        <AlertCircle className={cn(sizeClasses[size], 'text-amber-500')} />
        <div className="text-center">
          <p className="text-muted-foreground">
            Laster lenger enn forventet...
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Sjekk nettverkstilkoblingen din
          </p>
        </div>
      </div>
    );
  }

  const renderIcon = () => {
    switch (variant) {
      case 'spinner':
        return (
          <Loader2 className={cn(
            sizeClasses[size],
            'animate-spin text-primary'
          )} />
        );
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full bg-primary',
                  size === 'sm' ? 'h-1 w-1' : size === 'md' ? 'h-2 w-2' : 'h-3 w-3',
                  'animate-bounce'
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div className={cn(
            sizeClasses[size],
            'rounded-full bg-primary/20 animate-pulse'
          )} />
        );
      
      case 'skeleton':
        return (
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
        );
      
      default:
        return (
          <Loader2 className={cn(
            sizeClasses[size],
            'animate-spin text-primary'
          )} />
        );
    }
  };

  return (
    <div className={cn(
      'flex items-center justify-center',
      containerClasses[size],
      className
    )}>
      {variant !== 'skeleton' && renderIcon()}
      {variant === 'skeleton' && (
        <div className="w-full max-w-sm">
          {renderIcon()}
        </div>
      )}
      {message && variant !== 'skeleton' && (
        <span className="text-muted-foreground">{message}</span>
      )}
      {showTimeout && !hasTimedOut && (
        <Clock className="h-3 w-3 text-muted-foreground/50" />
      )}
    </div>
  );
};

/**
 * Page-level loading component
 */
export const PageLoader: React.FC<{ message?: string }> = ({ 
  message = "Laster..." 
}) => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingState 
      variant="spinner" 
      size="lg" 
      message={message}
      showTimeout={true}
    />
  </div>
);

/**
 * Inline loading component for smaller areas
 */
export const InlineLoader: React.FC<{ message?: string }> = ({ 
  message 
}) => (
  <LoadingState 
    variant="dots" 
    size="sm" 
    message={message}
    className="py-4"
  />
);