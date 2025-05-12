
import React from 'react';
import { DashboardLayout, DashboardWidget } from '@/components/dashboard';
import { useAuth } from '@/modules/auth/hooks';
import { Navigate } from 'react-router-dom';

export const CompanyDashboardPage = () => {
  const { isAuthenticated, role } = useAuth();
  
  // Redirect if not authenticated or not a company
  if (!isAuthenticated || (role !== 'company' && role !== 'admin' && role !== 'master_admin')) {
    return <Navigate to="/unauthorized" />;
  }
  
  return (
    <DashboardLayout title="Company Dashboard">
      <DashboardWidget title="My Leads" />
      <DashboardWidget title="Subscription Status" />
      <DashboardWidget title="Leads Stats" />
      <DashboardWidget title="Ad Exposure Stats" />
    </DashboardLayout>
  );
};

export default CompanyDashboardPage;
