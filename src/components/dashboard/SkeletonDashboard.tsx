import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const SkeletonDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded w-64 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-80 animate-pulse"></div>
        </div>
        <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                  <div className="h-8 bg-muted rounded w-16 animate-pulse"></div>
                </div>
                <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                <div className="h-10 bg-muted rounded w-full animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
                <div className="h-8 bg-muted rounded w-20 animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
                    </div>
                    <div className="w-16 h-6 bg-muted rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Property Card Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                </div>
              ))}
            </div>
            <div className="h-10 bg-muted rounded w-40 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-4/5 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-3/5 animate-pulse"></div>
                <div className="h-8 bg-muted rounded w-24 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};