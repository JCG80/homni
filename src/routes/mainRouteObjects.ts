import { lazy, createElement } from 'react';
import type { AppRoute } from './routeTypes';

// Lazy load all page components
const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })));
const MinimalHomePage = lazy(() => import('@/pages/MinimalHomePage').then(m => ({ default: m.MinimalHomePage })));
const DebugHomePage = lazy(() => import('@/pages/DebugHomePage').then(m => ({ default: m.DebugHomePage })));
const LoginPage = lazy(() => import('@/modules/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SelectServicesPage = lazy(() => import('@/pages/SelectServicesPage').then(m => ({ default: m.SelectServicesPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const PublicCompaniesDirectory = lazy(() => import('@/modules/insurance/pages/PublicCompaniesDirectory').then(m => ({ default: m.PublicCompaniesDirectory })));
const CategoryLandingPage = lazy(() => import('@/pages/categories/CategoryLandingPage').then(m => ({ default: m.CategoryLandingPage })));
const ThankYouPage = lazy(() => import('@/pages/ThankYouPage').then(m => ({ default: m.ThankYouPage })));
const PropertyDashboardPage = lazy(() => import('@/pages/PropertyDashboardPage'));
const NewPropertyPage = lazy(() => import('@/pages/NewPropertyPage'));
const CompanyLeadDashboardPage = lazy(() => import('@/pages/CompanyLeadDashboardPage'));

export const mainRouteObjects: AppRoute[] = [
  {
    path: '/',
    element: createElement(HomePage),
    roles: ['anonymous', 'user', 'company', 'content_editor', 'admin', 'master_admin'],
    navKey: 'home'
  },
  {
    path: '/test',
    element: createElement(MinimalHomePage),
    roles: ['anonymous', 'user', 'company', 'content_editor', 'admin', 'master_admin'],
    flag: 'ui:testPages',
    navKey: 'test'
  },
  {
    path: '/debug',
    element: createElement(DebugHomePage),
    roles: ['admin', 'master_admin'],
    flag: 'debug:enabled',
    navKey: 'debug'
  },
  {
    path: '/login',
    element: createElement(LoginPage),
    roles: ['anonymous'],
    navKey: 'login'
  },
  {
    path: '/dashboard',
    element: createElement(DashboardPage),
    roles: ['user', 'company', 'content_editor', 'admin', 'master_admin'],
    navKey: 'dashboard'
  },
  {
    path: '/select-services',
    element: createElement(SelectServicesPage),
    roles: ['anonymous', 'user', 'company'],
    navKey: 'select-services'
  },
  {
    path: '/forsikring/selskaper',
    element: createElement(PublicCompaniesDirectory),
    roles: ['anonymous', 'user', 'company'],
    navKey: 'insurance-companies'
  },
  {
    path: '/kategori/:slug',
    element: createElement(CategoryLandingPage),
    roles: ['anonymous', 'user', 'company'],
    navKey: 'category-landing'
  },
  {
    path: '/takk',
    element: createElement(ThankYouPage),
    roles: ['anonymous', 'user', 'company'],
    navKey: 'thank-you'
  },
  {
    path: '/properties',
    element: createElement(PropertyDashboardPage),
    roles: ['user', 'company', 'admin', 'master_admin'],
    navKey: 'properties'
  },
  {
    path: '/properties/new',
    element: createElement(NewPropertyPage),
    roles: ['user', 'company', 'admin', 'master_admin']
  },
  {
    path: '/company/leads',
    element: createElement(CompanyLeadDashboardPage),
    roles: ['company'],
    navKey: 'company-leads'
  },
];