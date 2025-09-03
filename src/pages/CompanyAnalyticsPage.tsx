import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { CompanyAnalyticsDashboard } from '@/components/analytics/CompanyAnalyticsDashboard';
import { useAuth } from '@/modules/auth/hooks';

export const CompanyAnalyticsPage = () => {
  const { profile } = useAuth();
  
  return (
    <PageLayout 
      title={`Company Analytics - ${profile?.display_name || 'Homni'}`}
      description="Comprehensive analytics and performance insights for your real estate business"
    >
      <CompanyAnalyticsDashboard />
    </PageLayout>
  );
};