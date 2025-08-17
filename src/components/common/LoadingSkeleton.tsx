import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  height?: 'sm' | 'md' | 'lg';
}

const heightClasses = {
  sm: 'h-4',
  md: 'h-6', 
  lg: 'h-8'
};

/**
 * Skeleton loader component for better UX during loading states
 * Uses semantic design tokens for consistent theming
 */
export const LoadingSkeleton = ({ 
  className, 
  lines = 3, 
  height = 'md' 
}: LoadingSkeletonProps) => {
  return (
    <div className={cn('space-y-3 animate-pulse', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'bg-muted rounded-md',
            heightClasses[height],
            index === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
};

interface PageSkeletonProps {
  hasHeader?: boolean;
  hasNavigation?: boolean;
  contentLines?: number;
}

/**
 * Full page skeleton for route loading states
 */
export const PageSkeleton = ({ 
  hasHeader = true, 
  hasNavigation = false,
  contentLines = 6 
}: PageSkeletonProps) => {
  return (
    <div className="animate-pulse space-y-6 p-6">
      {hasHeader && (
        <div className="space-y-3">
          <div className="h-8 bg-muted rounded-md w-1/3" />
          <div className="h-4 bg-muted rounded-md w-2/3" />
        </div>
      )}
      
      {hasNavigation && (
        <div className="flex space-x-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-10 bg-muted rounded-md w-24" />
          ))}
        </div>
      )}
      
      <div className="space-y-4">
        {Array.from({ length: contentLines }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="h-6 bg-muted rounded-md w-full" />
            <div className="h-4 bg-muted rounded-md w-5/6" />
            <div className="h-4 bg-muted rounded-md w-4/6" />
          </div>
        ))}
      </div>
    </div>
  );
};