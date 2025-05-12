
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardWidget } from '@/components/dashboard';

const AdminDashboard = () => (
  <DashboardLayout title="Admin Dashboard">
    <DashboardWidget title="User Management" />
    <DashboardWidget title="System Modules" />
    <DashboardWidget title="Leads Overview" />
    <DashboardWidget title="Content Admin" />
  </DashboardLayout>
);

export default AdminDashboard;
