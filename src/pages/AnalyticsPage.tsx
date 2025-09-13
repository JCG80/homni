import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { useAuth } from '@/modules/auth/hooks';

export const AnalyticsPage = () => {
  const { profile } = useAuth();
  
  return (
    <PageLayout 
      title={`Analytics - ${profile?.full_name || 'Homni'}`}
      description="Detaljerte analyser og rapporter for din aktivitet på Homni"
      showBreadcrumbs={true}
    >
      <AnalyticsDashboard />
    </PageLayout>
  );
};