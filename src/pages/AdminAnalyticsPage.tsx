import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { AdminAnalyticsDashboard } from '@/components/analytics/AdminAnalyticsDashboard';
import { useAuth } from '@/modules/auth/hooks';

export const AdminAnalyticsPage = () => {
  const { profile } = useAuth();
  
  return (
    <PageLayout 
      title="Platform Analytics - Homni Admin"
      description="System-wide analytics, monitoring, and business intelligence for the Homni platform"
    >
      <AdminAnalyticsDashboard />
    </PageLayout>
  );
};