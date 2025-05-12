
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardWidget } from '@/components/dashboard';

const MemberDashboard = () => (
  <DashboardLayout title="Member Dashboard">
    <DashboardWidget title="My Requests" />
    <DashboardWidget title="Property Overview" />
    <DashboardWidget title="Maintenance Calendar" />
    <DashboardWidget title="Recommended Services" />
  </DashboardLayout>
);

export default MemberDashboard;
