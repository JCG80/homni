
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardWidget } from '@/components/dashboard';

const MasterAdminDashboard = () => (
  <DashboardLayout title="Master Admin Dashboard">
    <DashboardWidget title="User Management" />
    <DashboardWidget title="System Modules" />
    <DashboardWidget title="Leads Overview" />
    <DashboardWidget title="Content Admin" />
    <DashboardWidget title="Role Management" />
    <DashboardWidget title="Module Config" />
    <DashboardWidget title="Internal Access Control" />
  </DashboardLayout>
);

export default MasterAdminDashboard;
