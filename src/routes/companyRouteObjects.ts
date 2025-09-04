import { lazy, createElement } from 'react';
import type { AppRoute } from './routeTypes';

const CompanyDashboard = lazy(() => import('@/modules/dashboard/CompanyDashboard').then(m => ({ default: m.CompanyDashboard })));
const LeadsManagement = lazy(() => import('@/modules/leads/pages/LeadsManagement').then(m => ({ default: m.LeadsManagement })));

export const companyRouteObjects: AppRoute[] = [
  {
    path: '/dashboard/company',
    element: createElement(CompanyDashboard),
    roles: ['company'],
    navKey: 'company-dashboard'
  },
  {
    path: '/leads',
    element: createElement(LeadsManagement),
    roles: ['admin', 'master_admin', 'company'],
    navKey: 'leads'
  },
];