import { lazy } from 'react';

// Define a simple route type since @/types/routing doesn't exist
interface AccountRoute {
  path: string;
  element: React.LazyExoticComponent<() => JSX.Element>;
  roles: string[];
  navKey: string;
}

// Lazy load account components for better performance
const AccountDashboard = lazy(() => import('@/pages/account/AccountDashboard').then(m => ({ default: m.AccountDashboard })));

export const accountRoutes: AccountRoute[] = [
  {
    path: '/account',
    element: AccountDashboard,
    roles: ['user', 'company', 'content_editor', 'admin', 'master_admin'],
    navKey: 'account'
  },
  {
    path: '/account/profile',
    element: AccountDashboard,
    roles: ['user', 'company', 'content_editor', 'admin', 'master_admin'],
    navKey: 'profile'
  },
  {
    path: '/account/settings',
    element: AccountDashboard, 
    roles: ['user', 'company', 'content_editor', 'admin', 'master_admin'],
    navKey: 'settings'
  }
];