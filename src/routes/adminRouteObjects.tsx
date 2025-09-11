import React, { lazy } from 'react';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import type { AppRoute } from './routeTypes';

// Lazy load admin pages
const CompaniesManagementPage = lazy(() => import('@/modules/admin/pages/CompaniesManagementPage'));
const MembersManagementPage = lazy(() => import('@/modules/admin/pages/MembersManagementPage'));
const RoleManagementPage = lazy(() => import('@/modules/admin/pages/RoleManagementPage'));
const InternalAccessPage = lazy(() => import('@/modules/admin/pages/InternalAccessPage'));
const SystemModulesPage = lazy(() => import('@/modules/admin/pages/SystemModulesPage'));
const AdminLeadsPage = lazy(() => import('@/modules/leads/pages/AdminLeadsPage'));
const InsightsDashboard = lazy(() => import('@/modules/smart-start-insights/pages/InsightsDashboard').then(module => ({ default: module.InsightsDashboard })));

// Master Admin specific pages
const MarketTrendsMD = lazy(() => import('@/modules/admin/pages/MarketTrendsMD').then(module => ({ default: module.MarketTrendsMD })));
const ApiGatewayStatus = lazy(() => import('@/modules/admin/pages/ApiGatewayStatus').then(module => ({ default: module.ApiGatewayStatus })));
const FeatureFlagsManagement = lazy(() => import('@/modules/admin/pages/FeatureFlagsManagement').then(module => ({ default: module.FeatureFlagsManagement })));
const ModuleManagementPage = lazy(() => import('@/modules/admin/pages/ModuleManagementPage').then(module => ({ default: module.ModuleManagementPage })));

export const adminRouteObjects: AppRoute[] = [
  // Main admin dashboard route
  {
    path: '/admin',
    element: (
      <RoleDashboard title="Admin Dashboard" requiredRole={['admin', 'master_admin']}>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the admin control panel.</p>
        </div>
      </RoleDashboard>
    ),
    roles: ['admin', 'master_admin'],
  },

  // Admin dashboard home
  {
    path: '/admin/dashboard',
    element: (
      <RoleDashboard title="Admin Dashboard" requiredRole={['admin', 'master_admin']}>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management tools.</p>
        </div>
      </RoleDashboard>
    ),
    roles: ['admin', 'master_admin'],
  },

  // Leads management
  {
    path: '/admin/leads',
    element: (
      <RoleDashboard title="Leads Management" requiredRole={['admin', 'master_admin']}>
        <AdminLeadsPage />
      </RoleDashboard>
    ),
    roles: ['admin', 'master_admin'],
  },

  // Companies management
  {
    path: '/admin/companies',
    element: (
      <RoleDashboard title="Companies Management" requiredRole={['admin', 'master_admin']}>
        <CompaniesManagementPage />
      </RoleDashboard>
    ),
    roles: ['admin', 'master_admin'],
  },

  // Members management
  {
    path: '/admin/members',
    element: (
      <RoleDashboard title="Members Management" requiredRole={['admin', 'master_admin']}>
        <MembersManagementPage />
      </RoleDashboard>
    ),
    roles: ['admin', 'master_admin'],
  },

  // SmartStart Insights Dashboard
  {
    path: '/admin/smart-insights',
    element: (
      <RoleDashboard title="SmartStart Insights" requiredRole={['admin', 'master_admin']}>
        <InsightsDashboard />
      </RoleDashboard>
    ),
    roles: ['admin', 'master_admin'],
    flag: 'ENABLE_SMART_INSIGHTS',
  },

  // System modules management
  {
    path: '/admin/system-modules',
    element: (
      <RoleDashboard title="System Modules" requiredRole={['admin', 'master_admin']}>
        <SystemModulesPage />
      </RoleDashboard>
    ),
    roles: ['admin', 'master_admin'],
  },

  // API & Integrations management
  {
    path: '/admin/api',
    element: (
      <RoleDashboard title="API & Integrations" requiredRole={['admin', 'master_admin']}>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">API & Integrations</h1>
          <p className="text-muted-foreground">Manage external integrations and API access.</p>
        </div>
      </RoleDashboard>
    ),
    roles: ['admin', 'master_admin'],
  },

  // Role management (master_admin only)
  {
    path: '/admin/roles',
    element: (
      <RoleDashboard title="Role Management" requiredRole={['master_admin']}>
        <RoleManagementPage />
      </RoleDashboard>
    ),
    roles: ['master_admin'],
  },

  // Internal access management (master_admin only)
  {
    path: '/admin/internal-access',
    element: (
      <RoleDashboard title="Internal Access" requiredRole={['master_admin']}>
        <InternalAccessPage />
      </RoleDashboard>
    ),
    roles: ['master_admin'],
  },

  // Feature flags management (master_admin only)
  {
    path: '/admin/feature-flags',
    element: (
      <RoleDashboard title="Feature Flags" requiredRole={['master_admin']}>
        <FeatureFlagsManagement />
      </RoleDashboard>
    ),
    roles: ['master_admin'],
  },

  // Module management (master_admin only)
  {
    path: '/admin/modules',
    element: (
      <RoleDashboard title="Module Management" requiredRole={['master_admin']}>
        <ModuleManagementPage />
      </RoleDashboard>
    ),
    roles: ['master_admin'],
  },

  // Market trends analysis (master_admin only)
  {
    path: '/admin/market-trends',
    element: (
      <RoleDashboard title="Market Trends MD" requiredRole={['master_admin']}>
        <MarketTrendsMD />
      </RoleDashboard>
    ),
    roles: ['master_admin'],
  },

  // API Gateway monitoring (master_admin only)
  {
    path: '/admin/api-gateway',
    element: (
      <RoleDashboard title="API Gateway Status" requiredRole={['master_admin']}>
        <ApiGatewayStatus />
      </RoleDashboard>
    ),
    roles: ['master_admin'],
  },
];