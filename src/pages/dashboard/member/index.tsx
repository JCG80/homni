
import React from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Kanban, BarChart, MessageSquare } from 'lucide-react';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { useFeatureFlag } from '@/modules/feature_flags/hooks/useFeatureFlag';
import { LeadKanbanWidget } from '@/modules/leads/components/kanban/LeadKanbanWidget';

const MemberDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled: showKanban } = useFeatureFlag('member_dashboard_kanban', true);
  
  return (
    <DashboardLayout title="Medlemsdashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick access cards */}
        <DashboardWidget title="Lead Kanban">
          <div className="flex items-center gap-3 mb-4">
            <Kanban className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-medium">Lead Management</h3>
              <p className="text-sm text-muted-foreground">Manage your leads with our Kanban board</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/leads/kanban')}
            className="w-full"
          >
            <Kanban className="mr-2 h-4 w-4" />
            Go to Kanban
          </Button>
        </DashboardWidget>
        
        <DashboardWidget title="Statistics">
          <div className="flex items-center gap-3 mb-4">
            <BarChart className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-medium">Performance Metrics</h3>
              <p className="text-sm text-muted-foreground">View your lead conversion rates</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/statistics')}
            className="w-full"
            variant="outline"
          >
            <BarChart className="mr-2 h-4 w-4" />
            View Statistics
          </Button>
        </DashboardWidget>
        
        <DashboardWidget title="Support">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-medium">Contact Support</h3>
              <p className="text-sm text-muted-foreground">Get help from our support team</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/support')}
            className="w-full"
            variant="outline"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        </DashboardWidget>
      </div>
      
      {showKanban && (
        <div className="mb-8">
          <LeadKanbanWidget />
        </div>
      )}
    </DashboardLayout>
  );
};

export default MemberDashboard;
