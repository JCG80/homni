
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

const MasterAdminDashboard = () => {
  return (
    <DashboardLayout title="Master Admin Dashboard">
      <div>System Configuration Widget</div>
      <div>User Management Widget</div>
      <div>Access Control Widget</div>
    </DashboardLayout>
  );
};

export default MasterAdminDashboard;
