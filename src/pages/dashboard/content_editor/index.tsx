
import React from 'react';
import { DashboardLayout, DashboardWidget } from '@/components/dashboard';
import { useAuth } from '@/modules/auth/hooks';
import { Navigate } from 'react-router-dom';

export const ContentEditorDashboardPage = () => {
  const { isAuthenticated, role } = useAuth();
  
  // Redirect if not authenticated or not a content editor
  if (!isAuthenticated || (role !== 'content_editor' && role !== 'admin' && role !== 'master_admin')) {
    return <Navigate to="/unauthorized" />;
  }
  
  return (
    <DashboardLayout title="Content Editor Dashboard">
      <DashboardWidget title="Content List" />
      <DashboardWidget title="Content Editor" />
      <DashboardWidget title="Preview" />
    </DashboardLayout>
  );
};

export default ContentEditorDashboardPage;
