/**
 * Lazy-loaded Dashboard Components for Optimal Performance
 */

import { lazy, Suspense } from 'react';
import { SkeletonDashboard } from './SkeletonDashboard';

// Lazy load all dashboard components
export const LazyConsolidatedUserDashboard = lazy(() => 
  import('./ConsolidatedUserDashboard').then(module => ({
    default: module.ConsolidatedUserDashboard
  }))
);

export const LazyAdminDashboard = lazy(() => 
  import('./AdminDashboard').then(module => ({
    default: module.AdminDashboard
  }))
);

export const LazyCompanyLeadDashboard = lazy(() => 
  import('../company/CompanyLeadDashboard').then(module => ({
    default: module.CompanyLeadDashboard
  }))
);

export const LazyContentEditorDashboard = lazy(() => 
  import('./ContentEditorDashboard')
);

export const LazyMasterAdminDashboard = lazy(() => 
  import('../master-admin/MasterAdminDashboard').then(module => ({
    default: module.MasterAdminDashboard
  }))
);

// Analytics dashboards
export const LazyUserAnalyticsDashboard = lazy(() => 
  import('../analytics/UserAnalyticsDashboard').then(module => ({
    default: module.UserAnalyticsDashboard
  }))
);

export const LazyCompanyAnalyticsDashboard = lazy(() => 
  import('../analytics/CompanyAnalyticsDashboard').then(module => ({
    default: module.CompanyAnalyticsDashboard
  }))
);

export const LazyAdminAnalyticsDashboard = lazy(() => 
  import('../analytics/AdminAnalyticsDashboard').then(module => ({
    default: module.AdminAnalyticsDashboard
  }))
);

// Wrapper component with consistent loading state
interface LazyDashboardWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyDashboardWrapper: React.FC<LazyDashboardWrapperProps> = ({ 
  children, 
  fallback = <SkeletonDashboard /> 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};