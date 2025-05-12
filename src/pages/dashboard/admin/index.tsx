
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

const AdminDashboard = () => {
  return (
    <DashboardLayout title="Admin Dashboard">
      <div>Admin Management Widget</div>
      <div>System Status Widget</div>
      <div>User Analytics Widget</div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
