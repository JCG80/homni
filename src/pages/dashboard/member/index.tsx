
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

const MemberDashboard = () => {
  return (
    <DashboardLayout title="Member Dashboard">
      <div>MyRequests Widget</div>
      <div>PropertyOverview Widget</div>
      <div>MaintenanceCalendar Widget</div>
      <div>RecommendedServices Widget</div>
    </DashboardLayout>
  );
};

export default MemberDashboard;
