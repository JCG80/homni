import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MetricData {
  value: string | number;
  label: string;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
    period?: string;
  };
  format?: 'currency' | 'percentage' | 'number';
}

export interface UnifiedDashboardCardProps {
  title: ReactNode;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  loading?: boolean;
  error?: string | null;
  metric?: MetricData;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
  }>;
  status?: 'success' | 'warning' | 'error' | 'info';
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="w-3 h-3" />;
    case 'down':
      return <TrendingDown className="w-3 h-3" />;
    default:
      return <Minus className="w-3 h-3" />;
  }
};

const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up':
      return 'text-success';
    case 'down':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
};

const formatValue = (value: string | number, format?: string) => {
  if (typeof value === 'string') return value;
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('no-NO', { 
        style: 'currency', 
        currency: 'NOK',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case 'percentage':
      return `${value}%`;
    case 'number':
      return new Intl.NumberFormat('no-NO').format(value);
    default:
      return value.toString();
  }
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'success':
      return 'border-l-success';
    case 'warning':
      return 'border-l-warning';
    case 'error':
      return 'border-l-destructive';
    case 'info':
      return 'border-l-info';
    default:
      return '';
  }
};

/**
 * Unified dashboard card component with consistent styling and behavior
 * Supports metrics, loading states, actions, and responsive design
 */
export const UnifiedDashboardCard: React.FC<UnifiedDashboardCardProps> = ({
  title,
  subtitle,
  children,
  className,
  loading = false,
  error = null,
  metric,
  actions = [],
  status,
  collapsible = false,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  // Loading state
  if (loading && !children) {
    return (
      <Card className={cn('border-l-4 border-l-muted animate-pulse', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-32"></div>
              {subtitle && <div className="h-3 bg-muted rounded w-24"></div>}
            </div>
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-8 bg-muted rounded w-20"></div>
            <div className="h-3 bg-muted rounded w-full"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn('border-l-4 border-l-destructive', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
            <p className="text-sm text-destructive font-medium">Kunne ikke laste data</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'border-l-4 transition-all duration-200 hover:shadow-md',
      getStatusColor(status),
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              {typeof title === 'string' ? (
                <span className="truncate">{title}</span>
              ) : (
                title
              )}
              {status && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    'text-xs px-1.5 py-0.5',
                    status === 'success' && 'border-success text-success',
                    status === 'warning' && 'border-warning text-warning',
                    status === 'error' && 'border-destructive text-destructive',
                    status === 'info' && 'border-info text-info'
                  )}
                >
                  {status}
                </Badge>
              )}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
          
          {/* Actions */}
          {actions.length > 0 && (
            <div className="flex items-center gap-1 ml-2">
              {actions.slice(0, 2).map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'ghost'}
                  size="sm"
                  onClick={action.onClick}
                  className="h-8 px-2 text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
          
          {loading && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-2 flex-shrink-0" />
          )}
        </div>

        {/* Metric Display */}
        {metric && (
          <div className="flex items-end justify-between pt-2">
            <div>
              <div className="text-2xl font-bold">
                {formatValue(metric.value, metric.format)}
              </div>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
            </div>
            {metric.change && (
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium',
                getTrendColor(metric.change.trend)
              )}>
                {getTrendIcon(metric.change.trend)}
                <span>
                  {metric.change.value > 0 ? '+' : ''}{metric.change.value}%
                </span>
                {metric.change.period && (
                  <span className="text-muted-foreground">
                    {metric.change.period}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </CardHeader>

      {(children || (!metric && !loading)) && (
        <CardContent className={cn(
          'transition-all duration-200',
          collapsible && !isExpanded && 'hidden'
        )}>
          {children || (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <p className="text-sm">Ingen data tilgjengelig</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

/**
 * Quick metric card variant for dashboard overview
 */
export const MetricCard: React.FC<{
  metric: MetricData;
  icon?: ReactNode;
  className?: string;
  loading?: boolean;
}> = ({ metric, icon, className, loading }) => (
  <UnifiedDashboardCard
    title={metric.label}
    metric={metric}
    loading={loading}
    className={cn('min-h-[120px]', className)}
  >
    {icon && (
      <div className="flex justify-end">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
    )}
  </UnifiedDashboardCard>
);