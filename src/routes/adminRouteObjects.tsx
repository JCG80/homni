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
];