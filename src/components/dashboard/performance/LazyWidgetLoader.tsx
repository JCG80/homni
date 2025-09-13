/**
 * Lazy Widget Loader - Optimized lazy loading for dashboard widgets
 * Phase 4: Performance & Polish
 */

import React, { Suspense, lazy, useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';

interface LazyWidgetLoaderProps {
  widgetId: string;
  importPath: string;
  fallbackHeight?: number;
  priority?: 'high' | 'medium' | 'low';
  preload?: boolean;
  retryAttempts?: number;
  children?: React.ReactNode;
}

interface WidgetErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  widgetId: string;
}

// Widget loading cache to prevent duplicate imports
const widgetCache = new Map<string, React.LazyExoticComponent<any>>();
const preloadQueue = new Set<string>();

/**
 * Error fallback component for failed widget loads
 */
const WidgetErrorFallback: React.FC<WidgetErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  widgetId
}) => (
  <Card className="border-destructive/50 bg-destructive/5">
    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
      <h3 className="font-medium text-destructive mb-1">Widget Failed to Load</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {widgetId} encountered an error
      </p>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={resetErrorBoundary}
        className="gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    </CardContent>
  </Card>
);

/**
 * Widget loading skeleton
 */
const WidgetSkeleton: React.FC<{ height?: number }> = ({ height = 200 }) => (
  <Card>
    <CardContent className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className={`w-full`} style={{ height: height - 60 }} />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </CardContent>
  </Card>
);

/**
 * Optimized lazy widget loader with intelligent preloading and error handling
 */
export const LazyWidgetLoader: React.FC<LazyWidgetLoaderProps> = ({
  widgetId,
  importPath,
  fallbackHeight = 200,
  priority = 'medium',
  preload = false,
  retryAttempts = 3,
  children
}) => {
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Get or create lazy component
  const LazyWidget = React.useMemo(() => {
    if (widgetCache.has(widgetId)) {
      return widgetCache.get(widgetId)!;
    }

    const lazyComponent = lazy(async () => {
      try {
        logger.debug(`Loading widget: ${widgetId}`);
        const startTime = performance.now();
        
        const module = await import(/* webpackChunkName: "[request]" */ importPath);
        
        const loadTime = performance.now() - startTime;
        logger.debug(`Widget loaded: ${widgetId}`, { loadTime });
        
        return module;
      } catch (error) {
        logger.error(`Failed to load widget: ${widgetId}`, { error });
        throw error;
      }
    });

    widgetCache.set(widgetId, lazyComponent);
    return lazyComponent;
  }, [widgetId, importPath]);

  // Intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px' // Start loading when 50px away from viewport
      }
    );

    const element = document.getElementById(`widget-${widgetId}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [widgetId]);

  // Preload widget if specified
  useEffect(() => {
    if (preload && !preloadQueue.has(widgetId)) {
      preloadQueue.add(widgetId);
      
      // Preload based on priority
      const delay = priority === 'high' ? 0 : priority === 'medium' ? 100 : 500;
      
      setTimeout(() => {
        // Preload lazy component
        try {
          import(importPath);
        } catch (error) {
          logger.debug(`Preload failed for ${widgetId}`, { error });
        }
      }, delay);
    }
  }, [preload, priority, widgetId, LazyWidget]);

  // Error boundary reset handler
  const handleErrorReset = () => {
    if (loadAttempts < retryAttempts) {
      setLoadAttempts(prev => prev + 1);
      // Clear cache to force reload
      widgetCache.delete(widgetId);
    }
  };

  // Don't render until visible or preloaded
  if (!isVisible && !preload) {
    return (
      <div 
        id={`widget-${widgetId}`}
        style={{ height: fallbackHeight }}
        className="w-full"
      >
        <WidgetSkeleton height={fallbackHeight} />
      </div>
    );
  }

  return (
    <div id={`widget-${widgetId}`} className="w-full">
      <ErrorBoundary
        FallbackComponent={(props) => (
          <WidgetErrorFallback {...props} widgetId={widgetId} />
        )}
        onReset={handleErrorReset}
        resetKeys={[loadAttempts]}
      >
        <Suspense fallback={<WidgetSkeleton height={fallbackHeight} />}>
          <LazyWidget />
          {children}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

/**
 * Preload multiple widgets based on priority
 */
export const preloadWidgets = (widgets: Array<{ id: string; path: string; priority?: 'high' | 'medium' | 'low' }>) => {
  const sortedWidgets = widgets.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
  });

  sortedWidgets.forEach((widget, index) => {
    const delay = index * 50; // Stagger preloads
    setTimeout(() => {
      if (!widgetCache.has(widget.id)) {
        const lazyComponent = lazy(() => import(widget.path));
        widgetCache.set(widget.id, lazyComponent);
        // Trigger actual import for preloading
        import(widget.path).catch(error => 
          logger.debug(`Preload failed for ${widget.id}`, { error })
        );
      }
    }, delay);
  });
};

/**
 * Clear widget cache (useful for development)
 */
export const clearWidgetCache = () => {
  widgetCache.clear();
  preloadQueue.clear();
};