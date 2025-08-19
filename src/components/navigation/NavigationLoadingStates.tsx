import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationLoadingStatesProps {
  state: 'loading' | 'error' | 'success';
  message?: string;
  className?: string;
  retryAction?: () => void;
}

export const NavigationLoadingStates: React.FC<NavigationLoadingStatesProps> = ({
  state,
  message,
  className,
  retryAction,
}) => {
  const getStateContent = () => {
    switch (state) {
      case 'loading':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center space-x-2 text-muted-foreground"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">
              {message || 'Laster navigasjon...'}
            </span>
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center space-x-2 text-destructive"
          >
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              {message || 'Feil ved lasting av navigasjon'}
            </span>
            {retryAction && (
              <button
                onClick={retryAction}
                className="text-xs underline hover:no-underline ml-2"
              >
                Prøv igjen
              </button>
            )}
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-success text-sm"
          >
            {message || 'Navigasjon lastet'}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("p-2", className)}>
      {getStateContent()}
    </div>
  );
};

interface NavigationSkeletonProps {
  itemCount?: number;
  variant?: 'vertical' | 'horizontal';
  className?: string;
}

export const NavigationSkeleton: React.FC<NavigationSkeletonProps> = ({
  itemCount = 4,
  variant = 'vertical',
  className,
}) => {
  return (
    <div 
      className={cn(
        "animate-pulse",
        variant === 'vertical' ? "space-y-2" : "flex space-x-4",
        className
      )}
    >
      {Array.from({ length: itemCount }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center space-x-2 rounded p-2",
            variant === 'vertical' ? "w-full" : "min-w-[100px]"
          )}
        >
          {/* Icon skeleton */}
          <div className="h-4 w-4 bg-muted rounded" />
          
          {/* Text skeleton */}
          <div 
            className={cn(
              "h-4 bg-muted rounded",
              variant === 'vertical' ? "flex-1" : "w-16"
            )}
          />
          
          {/* Badge skeleton (random occurrence) */}
          {Math.random() > 0.7 && (
            <div className="h-3 w-6 bg-muted rounded-full" />
          )}
        </div>
      ))}
    </div>
  );
};

interface RouteTransitionProps {
  isTransitioning: boolean;
  children: React.ReactNode;
  className?: string;
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({
  isTransitioning,
  children,
  className,
}) => {
  return (
    <motion.div
      className={cn("relative", className)}
      initial={false}
      animate={isTransitioning ? { opacity: 0.6 } : { opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
      
      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10"
        >
          <div className="flex items-center space-x-2 bg-background/80 px-4 py-2 rounded-lg shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Navigerer...
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default NavigationLoadingStates;