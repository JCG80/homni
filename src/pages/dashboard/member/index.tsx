
import React from 'react';
import { DashboardLayout, DashboardWidget } from '@/components/dashboard';
import { useAuth } from '@/modules/auth/hooks';
import { Navigate } from 'react-router-dom';

export const MemberDashboardPage = () => {
  const { isAuthenticated, role } = useAuth();
  
  // Redirect if not authenticated or not a member
  if (!isAuthenticated || (role !== 'member' && role !== 'admin' && role !== 'master_admin')) {
    return <Navigate to="/unauthorized" />;
  }
  
  return (
    <DashboardLayout title="Member Dashboard">
      <DashboardWidget title="My Requests" />
      <DashboardWidget title="Property Overview" />
      <DashboardWidget title="Maintenance Calendar" />
      <DashboardWidget title="Recommended Services" />
    </DashboardLayout>
  );
};

export default MemberDashboardPage;
