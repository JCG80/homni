
import React from 'react';
import { DashboardWidget } from '@/components/dashboard';
import { BarChart } from 'lucide-react';

export const AdStatisticsWidget = () => {
  return (
    <DashboardWidget title="Annonse Statistikk">
      <div className="flex items-center justify-center py-8 text-center">
        <div>
          <BarChart className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Annonse statistikk vil vises her</p>
        </div>
      </div>
    </DashboardWidget>
  );
};
