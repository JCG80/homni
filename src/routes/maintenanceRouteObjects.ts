import { lazy, createElement } from 'react';
import type { AppRoute } from './routeTypes';

const MaintenanceDashboard = lazy(() => import('@/modules/maintenance/components/MaintenanceDashboard').then(m => ({ default: m.MaintenanceDashboard })));
const MaintenanceAdmin = lazy(() => import('@/modules/maintenance/components/MaintenanceAdmin').then(m => ({ default: m.MaintenanceAdmin })));

export const maintenanceRouteObjects: AppRoute[] = [
  {
    path: '/maintenance',
    element: createElement(MaintenanceDashboard),
    roles: ['user', 'company', 'admin', 'master_admin'],
    flag: 'maintenance/dashboard',
    navKey: 'maintenance-dashboard'
  },
  {
    path: '/admin/maintenance',
    element: createElement(MaintenanceAdmin),
    roles: ['admin', 'master_admin'],
    flag: 'maintenance/admin',
    navKey: 'maintenance-admin'
  },
];