/**
 * Enhanced dashboard card component
 * Extends the existing DashboardWidget with loading states, error handling, and metrics
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardCardProps, Metric } from '../types';

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  children,
  className,
  isLoading = false,
  error = null,
  empty = false,
  emptyMessage = 'Ingen data tilgjengelig',
  emptyAction,
  actions,
  metric,
}) => {
  // Render loading state
  if (isLoading) {
    return (
      <Card className={cn('h-fit', className)}>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className={cn('border-destructive/50', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle size={20} />
            {typeof title === 'string' ? title : 'Error'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {error.message || 'En feil oppstod ved lasting av data'}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render empty state
  if (empty) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="text-muted-foreground mb-4">
              {emptyMessage}
            </div>
            {emptyAction}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {metric && <MetricDisplay metric={metric} />}
        {children}
      </CardContent>
    </Card>
  );
};

/**
 * Metric display component for showing key performance indicators
 */
const MetricDisplay: React.FC<{ metric: Metric }> = ({ metric }) => {
  const formatValue = (value: string | number, format?: string) => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('nb-NO', {
          style: 'currency',
          currency: 'NOK',
        }).format(value);
      case 'percentage':
        return `${value}%`;
      case 'bytes':
        return formatBytes(value);
      default:
        return new Intl.NumberFormat('nb-NO').format(value);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
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

  return (
    <div className="space-y-1">
      <div className="text-2xl font-bold">
        {formatValue(metric.value, metric.format)}
      </div>
      {metric.change && (
        <div className={cn('flex items-center gap-1 text-xs', getTrendColor(metric.change.trend))}>
          {getTrendIcon(metric.change.trend)}
          <span>
            {Math.abs(metric.change.value)}% fra {metric.change.period}
          </span>
        </div>
      )}
      <div className="text-xs text-muted-foreground">
        {metric.label}
      </div>
    </div>
  );
};

/**
 * Helper function to format bytes
 */
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}