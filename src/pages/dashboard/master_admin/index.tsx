
import React from 'react';
import { DashboardLayout, DashboardWidget } from '@/components/dashboard';
import { useAuth } from '@/modules/auth/hooks';
import { Navigate } from 'react-router-dom';

export const MasterAdminDashboardPage = () => {
  const { isAuthenticated, role } = useAuth();
  
  // Redirect if not authenticated or not a master admin
  if (!isAuthenticated || role !== 'master_admin') {
    return <Navigate to="/unauthorized" />;
  }
  
  return (
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
};

export default MasterAdminDashboardPage;
