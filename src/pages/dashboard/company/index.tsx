
import React from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LeadKanbanWidget } from '@/modules/leads/components/kanban/LeadKanbanWidget';
import { QuickActionsBar } from '@/components/dashboard/company/QuickActionsBar';
import { SubscriptionStatusWidget } from '@/components/dashboard/company/SubscriptionStatusWidget';
import { AdStatisticsWidget } from '@/components/dashboard/company/AdStatisticsWidget';
import { useFeatureFlag } from '@/modules/feature_flags/hooks/useFeatureFlag';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { isEnabled: showStatistics } = useFeatureFlag('company_dashboard_statistics', true);
  
  return (
    <DashboardLayout title="Firmaportal">
      <QuickActionsBar />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <LeadKanbanWidget className="mb-6" />
          
          <div className="flex justify-end">
            <Button
              onClick={() => navigate('/leads/kanban')}
              variant="outline"
            >
              Se full Kanban-tavle
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          <SubscriptionStatusWidget />
          {showStatistics && <AdStatisticsWidget />}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyDashboard;
