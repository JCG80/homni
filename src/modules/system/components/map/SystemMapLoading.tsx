
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const SystemMapLoading = () => {
  return (
    <div className="container mx-auto p-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-[550px]">
          {/* Tree visualization skeleton */}
          <div className="flex-1 border-dashed border-2 border-muted rounded-md p-4">
            <div className="flex items-center justify-center h-full">
              <div className="space-y-4 w-full max-w-md">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
                <div className="ml-16 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-[180px]" />
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-6">
                  <div className="animate-pulse flex space-x-2 items-center">
                    <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-lg font-medium text-muted-foreground">Laster systemkart...</p>
            <p className="text-sm text-muted-foreground mt-2">Vennligst vent mens vi henter moduldata</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
