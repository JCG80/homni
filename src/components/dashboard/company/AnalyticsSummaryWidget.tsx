
import React from 'react';
import { BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';

export const AnalyticsSummaryWidget: React.FC = () => {
  return (
    <DashboardWidget
      title={
        <div className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          <span>Analytics Summary</span>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Conversion rate</span>
            <span className="text-sm font-medium">24%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary w-1/4 rounded-full"></div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Response time</span>
            <span className="text-sm font-medium">1.4 hours</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary w-3/4 rounded-full"></div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Customer satisfaction</span>
            <span className="text-sm font-medium">92%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary w-11/12 rounded-full"></div>
          </div>
        </div>

        <Button variant="outline" className="w-full" asChild>
          <Link to="/dashboard/analytics">
            Full analytics report
          </Link>
        </Button>
      </div>
    </DashboardWidget>
  );
};
