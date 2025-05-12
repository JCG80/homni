
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardWidget } from '@/components/dashboard';

export const SubscriptionStatusWidget = () => {
  return (
    <DashboardWidget title="Abonnement Status">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <span>Aktive kreditter:</span>
          <Badge>24</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span>Abonnement:</span>
          <Badge variant="outline">Pro</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span>Neste fornying:</span>
          <span>01.06.2025</span>
        </div>
        <Button className="w-full mt-2">Oppgrader abonnement</Button>
      </div>
    </DashboardWidget>
  );
};
