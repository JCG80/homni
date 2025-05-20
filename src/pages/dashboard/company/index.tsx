
import React from 'react';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { LeadOverviewWidget } from '@/components/dashboard/company/LeadOverviewWidget';
import { AnalyticsSummaryWidget } from '@/components/dashboard/company/AnalyticsSummaryWidget';
import { QuickActionsWidget } from '@/components/dashboard/company/QuickActionsWidget';
import { TeamMembersWidget } from '@/components/dashboard/company/TeamMembersWidget';

const CompanyDashboard: React.FC = () => {
  return (
    <RoleDashboard requiredRole="company" title="Company Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <LeadOverviewWidget />
        <AnalyticsSummaryWidget />
        <QuickActionsWidget />
        <TeamMembersWidget />
      </div>
    </RoleDashboard>
  );
};

export default CompanyDashboard;
