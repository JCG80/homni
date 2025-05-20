
import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';

export const TeamMembersWidget: React.FC = () => {
  return (
    <DashboardWidget
      title={
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span>Team Members</span>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-medium">KL</span>
            </div>
            <div>
              <p className="text-sm font-medium">Kari Larsen</p>
              <p className="text-xs text-muted-foreground">Lead Manager</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-medium">OB</span>
            </div>
            <div>
              <p className="text-sm font-medium">Ole Berg</p>
              <p className="text-xs text-muted-foreground">Sales Rep</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-medium">SN</span>
            </div>
            <div>
              <p className="text-sm font-medium">Sofia Nielsen</p>
              <p className="text-xs text-muted-foreground">Sales Rep</p>
            </div>
          </div>
        </div>
        
        <Button variant="outline" size="sm" className="w-full">
          <Users className="mr-2 h-4 w-4" />
          Manage team
        </Button>
      </div>
    </DashboardWidget>
  );
};
