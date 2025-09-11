import { lazy } from 'react';
import { AppRoute } from './routeTypes';
import { Authenticated } from '@/modules/auth/components/Authenticated';

const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));  
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const PropertyPage = lazy(() => import('@/pages/PropertyPage'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));

export const mainRouteObjects: AppRoute[] = [
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/property',
    element: <Authenticated><PropertyPage /></Authenticated>,
    roles: ['user', 'company', 'admin', 'master_admin']
  },
  {
    path: '/dashboard',
    element: <Authenticated><Dashboard /></Authenticated>,
    roles: ['user', 'company', 'admin', 'master_admin']
  }
];