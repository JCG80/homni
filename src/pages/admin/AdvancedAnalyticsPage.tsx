import React from 'react';
import { Helmet } from 'react-helmet';
import { AdvancedAnalytics } from '@/modules/admin/components/AdvancedAnalytics';
import { useAuth } from '@/modules/auth/hooks';
import { Navigate } from 'react-router-dom';

export const AdvancedAnalyticsPage: React.FC = () => {
  const { isAdmin, isMasterAdmin, isAuthenticated } = useAuth();

  if (!isAuthenticated || (!isAdmin && !isMasterAdmin)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Advanced Analytics - Homni</title>
        <meta name="description" content="Detailed analytics and insights for the Homni platform" />
      </Helmet>
      <AdvancedAnalytics />
    </>
  );
};