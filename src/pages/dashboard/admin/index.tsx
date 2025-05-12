
import React from 'react';
import { DashboardLayout, DashboardWidget } from '@/components/dashboard';
import { useAuth } from '@/modules/auth/hooks';
import { Navigate } from 'react-router-dom';

export const AdminDashboardPage = () => {
  const { isAuthenticated, role } = useAuth();
  
  // Redirect if not authenticated or not an admin
  if (!isAuthenticated || (role !== 'admin' && role !== 'master_admin')) {
    return <Navigate to="/unauthorized" />;
  }
  
  return (
    <DashboardLayout title="Admin Dashboard">
      <DashboardWidget title="User Management" />
      <DashboardWidget title="System Modules" />
      <DashboardWidget title="Leads Overview" />
      <DashboardWidget title="Content Admin" />
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
