import { lazy, createElement } from 'react';
import type { AppRoute } from './routeTypes';

const AdminLeadsPage = lazy(() => import('@/modules/leads/pages/AdminLeadsPage').then(m => ({ default: m.AdminLeadsPage })));
const AdminDashboard = lazy(() => import('@/components/dashboard/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

export const adminRouteObjects: AppRoute[] = [
  {
    path: '/admin/dashboard',
    element: createElement(AdminDashboard),
    roles: ['admin', 'master_admin'],
    navKey: 'admin-dashboard'
  },
  {
    path: '/admin/leads',
    element: createElement(AdminLeadsPage),
    roles: ['admin', 'master_admin'],
    navKey: 'admin-leads'
  },
];