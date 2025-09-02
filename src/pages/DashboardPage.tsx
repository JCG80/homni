import React from 'react';
import { EnhancedUserDashboard } from '@/components/dashboard/EnhancedUserDashboard';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/modules/auth/hooks';

export const DashboardPage = () => {
  const { profile } = useAuth();
  
  return (
    <PageLayout 
      title={`Dashboard - ${profile?.full_name || 'Homni'}`}
      description="Se oversikt over dine forespørsler og aktivitet på Homni"
    >
      <EnhancedUserDashboard />
    </PageLayout>
  );
};