import React from 'react';
import { UserLayout } from '@/components/layout/UserLayout';
import type { AppRoute } from './routeTypes';

// Lazy load components for better performance
const HomePage = React.lazy(() => import('@/pages/HomePage'));
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage')); 
const LeadsPage = React.lazy(() => import('@/pages/LeadsPage'));
const ProfilePage = React.lazy(() => import('@/pages/ProfilePage'));
const UserDashboard = React.lazy(() => import('@/pages/UserDashboard'));
const LoginPage = React.lazy(() => import('@/pages/LoginPage'));
const RegisterPage = React.lazy(() => import('@/pages/RegisterPage'));
const NewPropertyPage = React.lazy(() => import('@/pages/NewPropertyPage'));
const NewLeadPage = React.lazy(() => import('@/pages/NewLeadPage'));
const PropertiesPage = React.lazy(() => import('@/modules/property/pages/PropertiesPage'));
const MaintenanceCalendarPage = React.lazy(() => import('@/pages/MaintenanceCalendarPage'));
const AuthTestPage = React.lazy(() => import('@/pages/AuthTestPage'));

const MarketplacePage = React.lazy(() => import('@/pages/MarketplacePage'));

export const mainRouteObjects: AppRoute[] = [
  // Public routes (no layout wrapper)
  {
    path: '/login',
    element: <LoginPage />,
    alwaysAvailable: true
  },
  {
    path: '/register', 
    element: <RegisterPage />,
    alwaysAvailable: true
  },
  
  // User routes wrapped in UserLayout
  {
    path: '/',
    element: <UserLayout />,
    alwaysAvailable: true,
    children: [
      {
        index: true,
        element: <HomePage />,
        alwaysAvailable: true
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
        roles: ['user', 'company', 'content_editor', 'admin', 'master_admin', 'guest']
      },
      {
        path: 'dashboard/user',
        element: <UserDashboard />,
        roles: ['user']
      },
      {
        path: 'leads',
        element: <LeadsPage />,
        roles: ['user', 'company']
      },
      {
        path: 'profile',
        element: <ProfilePage />,
        roles: ['user', 'company', 'content_editor', 'admin', 'master_admin']
      },
      {
        path: 'properties',
        element: <PropertiesPage />,
        roles: ['user']
      },
      {
        path: 'properties/new',
        element: <NewPropertyPage />,
        roles: ['user']
      },
      {
        path: 'leads/new',
        element: <NewLeadPage />,
        roles: ['user']
      },
      {
        path: 'marketplace',
        element: <MarketplacePage />,
        roles: ['company', 'admin', 'master_admin'],
        flag: 'ENABLE_LEAD_MARKETPLACE'
      },
      {
        path: 'maintenance/calendar',
        element: <MaintenanceCalendarPage />,
        roles: ['user', 'company', 'admin', 'master_admin']
      },
      {
        path: 'auth-test',
        element: <AuthTestPage />,
        roles: ['guest', 'user', 'company', 'admin', 'master_admin']
      }
    ]
  }
];