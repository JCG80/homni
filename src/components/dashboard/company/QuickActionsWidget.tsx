
import React from 'react';
import { Plus, Activity, Users, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardWidget } from '@/components/dashboard';

export const QuickActionsWidget: React.FC = () => {
  return (
    <DashboardWidget
      title={
        <div className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          <span>Quick Actions</span>
        </div>
      }
    >
      <div className="grid gap-2">
        <Button className="justify-start">
          <Plus className="mr-2 h-4 w-4" />
          Create lead
        </Button>
        <Button variant="outline" className="justify-start">
          <Activity className="mr-2 h-4 w-4" />
          Update lead status
        </Button>
        <Button variant="outline" className="justify-start">
          <Users className="mr-2 h-4 w-4" />
          Update company profile
        </Button>
        <Button variant="outline" className="justify-start">
          <BarChart className="mr-2 h-4 w-4" />
          Generate report
        </Button>
      </div>
    </DashboardWidget>
  );
};
