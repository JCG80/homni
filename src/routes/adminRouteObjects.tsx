import React from 'react';
import { AdminLayout } from '@/components/layout/admin/AdminLayout';
import type { AppRoute } from './routeTypes';

// Lazy load admin components
const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminLeads = React.lazy(() => import('@/pages/admin/AdminLeads'));
const AdminCompanies = React.lazy(() => import('@/pages/admin/AdminCompanies'));
const AdminMembers = React.lazy(() => import('@/pages/admin/AdminMembers'));
const FeatureFlagsManagement = React.lazy(() => import('@/modules/admin/pages/FeatureFlagsManagement'));

export const adminRouteObjects: AppRoute[] = [
  {
    path: '/admin',
    element: <AdminLayout />,
    roles: ['admin', 'master_admin'],
    children: [
      {
        index: true,
        element: <AdminDashboard />,
        roles: ['admin', 'master_admin']
      },
      {
        path: 'dashboard',
        element: <AdminDashboard />,
        roles: ['admin', 'master_admin']
      },
      {
        path: 'leads',
        element: <AdminLeads />,
        roles: ['admin', 'master_admin']
      },
      {
        path: 'companies',
        element: <AdminCompanies />,
        roles: ['admin', 'master_admin']
      },
      {
        path: 'members',
        element: <AdminMembers />,
        roles: ['admin', 'master_admin']
      },
      {
        path: 'feature-flags',
        element: <FeatureFlagsManagement />,
        roles: ['master_admin']
      }
    ]
  }
];