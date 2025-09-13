import React from 'react';
import { Helmet } from 'react-helmet';
import { MasterAdminDashboard } from '@/modules/admin/components/MasterAdminDashboard';
import { useAuth } from '@/modules/auth/hooks';
import { Navigate } from 'react-router-dom';

export const MasterAdminPage: React.FC = () => {
  const { isMasterAdmin, isAuthenticated } = useAuth();

  if (!isAuthenticated || !isMasterAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Master Admin - Homni</title>
        <meta name="description" content="Master administrator dashboard for system oversight and control" />
      </Helmet>
      <MasterAdminDashboard />
    </>
  );
};