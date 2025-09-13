import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { useAuth } from '@/modules/auth/hooks';
import { SmartBreadcrumbs } from '@/components/navigation/SmartBreadcrumbs';

export const AnalyticsPage = () => {
  const { profile } = useAuth();
  
  return (
    <PageLayout 
      title={`Analytics - ${profile?.full_name || 'Homni'}`}
      description="Detaljerte analyser og rapporter for din aktivitet på Homni"
    >
      <div className="space-y-6">
        <SmartBreadcrumbs />
        <AnalyticsDashboard />
      </div>
    </PageLayout>
  );
};