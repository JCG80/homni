
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const SystemMapLoading = () => {
  return (
    <div className="container mx-auto p-6">
      <Card className="shadow-sm">
        <CardContent className="flex items-center justify-center h-[600px]">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"></div>
            <p className="text-lg font-medium text-muted-foreground">Laster systemkart...</p>
            <p className="text-sm text-muted-foreground mt-2">Vennligst vent mens vi henter moduldata</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
