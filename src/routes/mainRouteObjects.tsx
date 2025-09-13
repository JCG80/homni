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
        roles: ['user', 'company', 'content_editor']
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
      }
    ]
  }
];