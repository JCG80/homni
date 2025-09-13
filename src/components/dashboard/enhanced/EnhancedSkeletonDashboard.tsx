import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface SkeletonCardProps {
  height?: string;
  showHeader?: boolean;
  rows?: number;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  height = "h-32", 
  showHeader = true, 
  rows = 2 
}) => (
  <Card className="animate-pulse">
    {showHeader && (
      <CardHeader>
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
      </CardHeader>
    )}
    <CardContent className={`space-y-3 ${height}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 bg-muted rounded w-full"></div>
          <div className="h-3 bg-muted rounded w-5/6"></div>
        </div>
      ))}
    </CardContent>
  </Card>
);

const SkeletonMetricCard: React.FC = () => (
  <Card className="animate-pulse">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-20"></div>
          <div className="h-8 bg-muted rounded w-16"></div>
        </div>
        <div className="w-10 h-10 bg-muted rounded-full"></div>
      </div>
    </CardContent>
  </Card>
);

/**
 * Enhanced skeleton dashboard with progressive loading states
 * Optimized for perceived performance and smooth UX
 */
export const EnhancedSkeletonDashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded w-64 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-48 animate-pulse"></div>
        </div>
        <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
      </div>

      {/* Quick Actions Skeleton */}
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded w-24"></div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonMetricCard key={i} />
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkeletonCard height="h-48" rows={3} />
        <SkeletonCard height="h-48" rows={3} />
        <SkeletonCard height="h-48" rows={3} />
      </div>

      {/* Large Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard height="h-64" rows={4} />
        <SkeletonCard height="h-64" rows={4} />
      </div>

      {/* Loading indicator with progress simulation */}
      <div className="fixed bottom-4 right-4 bg-background border shadow-lg rounded-lg p-4 max-w-sm">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Laster dashboard...</p>
            <div className="h-1.5 bg-muted rounded-full w-32">
              <div className="h-1.5 bg-primary rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};