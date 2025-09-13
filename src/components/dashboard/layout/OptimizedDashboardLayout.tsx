import React, { Suspense, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { EnhancedSkeletonDashboard } from '../enhanced/EnhancedSkeletonDashboard';
import { DashboardPerformanceMonitor } from '../performance/DashboardPerformanceMonitor';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
  showPerformanceMonitor?: boolean;
  loading?: boolean;
  error?: Error | null;
}

interface DashboardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  actions?: React.ReactNode;
}

const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <div className="flex items-center justify-center min-h-[400px] p-6">
    <div className="text-center space-y-4 max-w-md">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
        <span className="text-2xl">⚠️</span>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-destructive">Dashboard Error</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Noe gikk galt ved lasting av dashboard.
        </p>
        <details className="mt-4 text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground">Tekniske detaljer</summary>
          <pre className="mt-2 p-2 bg-muted rounded text-left overflow-auto">
            {error.message}
          </pre>
        </details>
      </div>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Prøv igjen
      </button>
    </div>
  </div>
);

/**
 * Optimized dashboard layout with performance monitoring and error boundaries
 */
export const OptimizedDashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  className,
  showPerformanceMonitor = process.env.NODE_ENV === 'development',
  loading = false,
  error = null,
}) => {
  if (loading) {
    return <EnhancedSkeletonDashboard />;
  }

  if (error) {
    return <ErrorFallback error={error} resetErrorBoundary={() => window.location.reload()} />;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className={cn('space-y-6 animate-fade-in', className)}>
        {showPerformanceMonitor && (
          <div className="fixed bottom-4 left-4 z-50 max-w-xs">
            <DashboardPerformanceMonitor visible={true} />
          </div>
        )}
        
        <Suspense fallback={<EnhancedSkeletonDashboard />}>
          {children}
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

/**
 * Responsive dashboard grid system
 */
export const DashboardGrid: React.FC<DashboardGridProps> = ({
  children,
  columns = 3,
  gap = 'md',
  className,
}) => {
  const gridClasses = useMemo(() => {
    const colClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 lg:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    };

    const gapClasses = {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
    };

    return cn('grid', colClasses[columns], gapClasses[gap], className);
  }, [columns, gap, className]);

  return <div className={gridClasses}>{children}</div>;
};

/**
 * Dashboard section with optional collapsible behavior
 */
export const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  subtitle,
  children,
  className,
  collapsible = false,
  defaultExpanded = true,
  actions,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div 
          className={cn(
            "space-y-1 flex-1 min-w-0",
            collapsible && "cursor-pointer select-none"
          )}
          onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
        >
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            {title}
            {collapsible && (
              <span className={cn(
                "transition-transform duration-200",
                isExpanded ? "rotate-90" : "rotate-0"
              )}>
                ▶
              </span>
            )}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      <div className={cn(
        "transition-all duration-300 ease-in-out",
        collapsible && !isExpanded && "hidden"
      )}>
        {children}
      </div>
    </section>
  );
};

/**
 * Quick stats row for dashboard metrics
 */
export const DashboardStatsRow: React.FC<{
  stats: Array<{
    label: string;
    value: string | number;
    change?: {
      value: number;
      trend: 'up' | 'down' | 'neutral';
    };
    icon?: React.ReactNode;
  }>;
  className?: string;
}> = ({ stats, className }) => (
  <DashboardGrid 
    columns={stats.length <= 2 ? 2 : stats.length <= 4 ? 4 : 3} 
    gap="md" 
    className={className}
  >
    {stats.map((stat, index) => (
      <div 
        key={index}
        className="bg-card border rounded-lg p-4 space-y-2"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{stat.label}</span>
          {stat.icon && (
            <div className="text-muted-foreground">
              {stat.icon}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold">{stat.value}</div>
          {stat.change && (
            <div className={cn(
              "text-xs flex items-center gap-1",
              stat.change.trend === 'up' && "text-success",
              stat.change.trend === 'down' && "text-destructive",
              stat.change.trend === 'neutral' && "text-muted-foreground"
            )}>
              <span>
                {stat.change.trend === 'up' ? '↗' : 
                 stat.change.trend === 'down' ? '↘' : '→'}
              </span>
              <span>{Math.abs(stat.change.value)}%</span>
            </div>
          )}
        </div>
      </div>
    ))}
  </DashboardGrid>
);