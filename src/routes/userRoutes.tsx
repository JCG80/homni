import React from 'react';
import { Route } from 'react-router-dom';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import { DashboardRouter } from '@/modules/dashboard/DashboardRouter';

// Feature flag wrapper component
const FeatureFlagRoute = ({ flagName, children }: { flagName: string; children: React.ReactNode }) => {
  const { isEnabled } = useFeatureFlag(flagName);
  return isEnabled ? <>{children}</> : null;
};

export const userRoutes = [
  <Route 
    key="dashboard" 
    path="/dashboard" 
    element={
      <RequireAuth roles={['user', 'company', 'admin', 'master_admin', 'content_editor']}>
        <DashboardRouter />
      </RequireAuth>
    } 
  />,
  
  // Sprint 4-6 routes behind feature flags (OFF by default)
  ...(() => {
    const PropertyPage = React.lazy(() => import('@/pages/PropertyPage').then(m => ({ default: m.PropertyPage })));
    const PropertyDetailsPage = React.lazy(() => import('@/pages/PropertyDetailsPage').then(m => ({ default: m.PropertyDetailsPage })));
    const DIYSalesPage = React.lazy(() => import('@/pages/DIYSalesPage').then(m => ({ default: m.DIYSalesPage })));
    const AnalyticsPage = React.lazy(() => import('@/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
    const CompanyAnalyticsPage = React.lazy(() => import('@/pages/CompanyAnalyticsPage').then(m => ({ default: m.CompanyAnalyticsPage })));
    const AdminAnalyticsPage = React.lazy(() => import('@/pages/AdminAnalyticsPage').then(m => ({ default: m.AdminAnalyticsPage })));

    return [
      <Route 
        key="property" 
        path="/property" 
        element={
          <FeatureFlagRoute flagName="ENABLE_PROPERTY_MANAGEMENT">
            <RequireAuth roles={['user', 'company', 'admin', 'master_admin']}>
              <React.Suspense fallback={<div>Loading...</div>}>
                <PropertyPage />
              </React.Suspense>
            </RequireAuth>
          </FeatureFlagRoute>
        } 
      />,
      <Route 
        key="property-details" 
        path="/property/:id" 
        element={
          <FeatureFlagRoute flagName="ENABLE_PROPERTY_MANAGEMENT">
            <RequireAuth roles={['user', 'company', 'admin', 'master_admin']}>
              <React.Suspense fallback={<div>Loading...</div>}>
                <PropertyDetailsPage />
              </React.Suspense>
            </RequireAuth>
          </FeatureFlagRoute>
        } 
      />,
      <Route 
        key="diy-sales" 
        path="/diy-sales" 
        element={
          <FeatureFlagRoute flagName="ENABLE_DIY_SALES">
            <RequireAuth roles={['user', 'company', 'admin', 'master_admin']}>
              <React.Suspense fallback={<div>Loading...</div>}>
                <DIYSalesPage />
              </React.Suspense>
            </RequireAuth>
          </FeatureFlagRoute>
        } 
      />,
      <Route 
        key="analytics" 
        path="/analytics" 
        element={
          <FeatureFlagRoute flagName="ENABLE_ANALYTICS_DASHBOARD">
            <RequireAuth roles={['user', 'company', 'admin', 'master_admin']}>
              <React.Suspense fallback={<div>Loading...</div>}>
                <AnalyticsPage />
              </React.Suspense>
            </RequireAuth>
          </FeatureFlagRoute>
        } 
      />,
      <Route 
        key="company-analytics" 
        path="/company-analytics" 
        element={
          <FeatureFlagRoute flagName="ENABLE_ANALYTICS_DASHBOARD">
            <RequireAuth roles={['company', 'admin', 'master_admin']}>
              <React.Suspense fallback={<div>Loading...</div>}>
                <CompanyAnalyticsPage />
              </React.Suspense>
            </RequireAuth>
          </FeatureFlagRoute>
        } 
      />,
      <Route 
        key="admin-analytics" 
        path="/admin-analytics" 
        element={
          <FeatureFlagRoute flagName="ENABLE_ANALYTICS_DASHBOARD">
            <RequireAuth roles={['admin', 'master_admin']}>
              <React.Suspense fallback={<div>Loading...</div>}>
                <AdminAnalyticsPage />
              </React.Suspense>
            </RequireAuth>
          </FeatureFlagRoute>
        } 
      />,
    ];
  })()
];