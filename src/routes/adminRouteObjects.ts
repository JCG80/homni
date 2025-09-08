import { lazy, createElement } from 'react';
import type { AppRoute } from './routeTypes';

const AdminLeadsPage = lazy(() => import('@/modules/leads/pages/AdminLeadsPage').then(m => ({ default: m.AdminLeadsPage })));
const AdminDashboard = lazy(() => import('@/components/dashboard/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ApiAdminPage = lazy(() => import('@/pages/admin/ApiAdminPage').then(m => ({ default: m.default })));
const RoleManagementPage = lazy(() => import('@/modules/admin/pages/RoleManagementPage').then(m => ({ default: m.default })));
const MembersManagementPage = lazy(() => import('@/modules/admin/pages/MembersManagementPage').then(m => ({ default: m.MembersManagementPage })));
const CompaniesManagementPage = lazy(() => import('@/modules/admin/pages/CompaniesManagementPage').then(m => ({ default: m.default })));
const SystemModulesPage = lazy(() => import('@/modules/system/pages/SystemModulesPage').then(m => ({ default: m.SystemModulesPage })));
const InternalAccessPage = lazy(() => import('@/modules/admin/pages/InternalAccessPage').then(m => ({ default: m.default })));

export const adminRouteObjects: AppRoute[] = [
  {
    path: '/admin/dashboard',
    element: createElement(AdminDashboard),
    roles: ['admin', 'master_admin'],
    navKey: 'admin-dashboard'
  },
  {
    path: '/admin/api',
    element: createElement(ApiAdminPage),
    roles: ['admin', 'master_admin'],
    navKey: 'admin-api'
  },
  {
    path: '/admin/leads',
    element: createElement(AdminLeadsPage),
    roles: ['admin', 'master_admin'],
    navKey: 'admin-leads'
  },
  {
    path: '/admin/roles',
    element: createElement(RoleManagementPage),
    roles: ['master_admin'],
    navKey: 'admin-roles'
  },
  {
    path: '/admin/members',
    element: createElement(MembersManagementPage),
    roles: ['master_admin'],
    navKey: 'admin-members'
  },
  {
    path: '/admin/companies',
    element: createElement(CompaniesManagementPage),
    roles: ['master_admin'],
    navKey: 'admin-companies'
  },
  {
    path: '/admin/system-modules',
    element: createElement(SystemModulesPage),
    roles: ['master_admin'],
    navKey: 'admin-system-modules'
  },
  {
    path: '/admin/internal-access',
    element: createElement(InternalAccessPage),
    roles: ['master_admin'],
    navKey: 'admin-internal-access'
  },
];