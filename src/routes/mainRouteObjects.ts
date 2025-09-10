import { lazy, createElement } from 'react';
import type { AppRoute } from './routeTypes';
import { companyRouteObjects } from './companyRouteObjects';
import { contentEditorRouteObjects } from './contentEditorRouteObjects';
import { insuranceRouteObjects } from './insuranceRouteObjects';
import { leadRouteObjects } from './leadRouteObjects';
import { marketplaceRouteObjects } from './marketplaceRouteObjects';
import { featureRouteObjects } from './featureRouteObjects';

// Lazy load all page components
const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })));
const MinimalHomePage = lazy(() => import('@/pages/MinimalHomePage').then(m => ({ default: m.MinimalHomePage })));
const DebugHomePage = lazy(() => import('@/pages/DebugHomePage').then(m => ({ default: m.DebugHomePage })));
const LoginPage = lazy(() => import('@/modules/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SelectServicesPage = lazy(() => import('@/pages/SelectServicesPage').then(m => ({ default: m.SelectServicesPage })));
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const PublicCompaniesDirectory = lazy(() => import('@/modules/insurance/pages/PublicCompaniesDirectory').then(m => ({ default: m.PublicCompaniesDirectory })));
const CategoryLandingPage = lazy(() => import('@/pages/categories/CategoryLandingPage').then(m => ({ default: m.CategoryLandingPage })));
const ThankYouPage = lazy(() => import('@/pages/ThankYouPage').then(m => ({ default: m.ThankYouPage })));
const PropertyDashboardPage = lazy(() => import('@/pages/PropertyDashboardPage'));
const NewPropertyPage = lazy(() => import('@/pages/NewPropertyPage'));
const CompanyLeadDashboardPage = lazy(() => import('@/pages/CompanyLeadDashboardPage'));

// Auth and Account pages
const ProfilePageWrapper = lazy(() => import('./components/ProfilePageWrapper').then(m => ({ default: m.ProfilePageWrapper })));
const AccountPageWrapper = lazy(() => import('./components/AccountPageWrapper').then(m => ({ default: m.AccountPageWrapper })));

// Settings redirect
const SettingsRedirect = lazy(() => import('./components/SettingsRedirect').then(m => ({ default: m.SettingsRedirect })));

// Dashboard router for unified dashboard experience
const DashboardRouter = lazy(() => import('@/modules/dashboard/DashboardRouter').then(m => ({ default: m.DashboardRouter })));

export const mainRouteObjects: AppRoute[] = [
  {
    path: '/',
    element: createElement(HomePage),
    roles: ['guest', 'user', 'company', 'content_editor', 'admin', 'master_admin'],
    navKey: 'home'
  },
  {
    path: '/test',
    element: createElement(MinimalHomePage),
    roles: ['guest', 'user', 'company', 'content_editor', 'admin', 'master_admin'],
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
    roles: ['guest', 'user', 'company', 'content_editor', 'admin', 'master_admin'],
    navKey: 'login'
  },
  {
    path: '/dashboard',
    element: createElement(Dashboard),
    roles: ['user', 'company', 'content_editor', 'admin', 'master_admin'],
    navKey: 'dashboard'
  },
  {
    path: '/select-services',
    element: createElement(SelectServicesPage),
    roles: ['guest', 'user', 'company'],
    navKey: 'select-services'
  },
  {
    path: '/forsikring/selskaper',
    element: createElement(PublicCompaniesDirectory),
    roles: ['guest', 'user', 'company'],
    navKey: 'insurance-companies'
  },
  {
    path: '/kategori/:slug',
    element: createElement(CategoryLandingPage),
    roles: ['guest', 'user', 'company'],
    navKey: 'category-landing'
  },
  {
    path: '/takk',
    element: createElement(ThankYouPage),
    roles: ['guest', 'user', 'company'],
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
  // Role-specific dashboard routes - using DashboardRouter for unified experience
  {
    path: '/dashboard/admin',
    element: createElement(DashboardRouter),
    roles: ['admin', 'master_admin'],
    navKey: 'admin-dashboard'
  },
  {
    path: '/dashboard/company',
    element: createElement(DashboardRouter),
    roles: ['company'],
    navKey: 'company-dashboard'
  },
  {
    path: '/dashboard/user', 
    element: createElement(DashboardRouter),
    roles: ['user'],
    navKey: 'user-dashboard'
  },
  {
    path: '/dashboard/content-editor',
    element: createElement(DashboardRouter),
    roles: ['content_editor'],
    navKey: 'content-editor-dashboard'
  },
  {
    path: '/dashboard/master-admin',
    element: createElement(DashboardRouter),
    roles: ['master_admin'],
    navKey: 'master-admin-dashboard'
  },
  // Profile and Account routes
  {
    path: '/profile',
    element: createElement(ProfilePageWrapper),
    roles: ['user', 'company', 'content_editor', 'admin', 'master_admin'],
    navKey: 'profile'
  },
  {
    path: '/account',
    element: createElement(AccountPageWrapper),
    roles: ['user', 'company', 'content_editor', 'admin', 'master_admin'],
    navKey: 'account'
  },
  // Settings redirect to account
  {
    path: '/settings',
    element: createElement(SettingsRedirect),
    roles: ['user', 'company', 'content_editor', 'admin', 'master_admin']
  },
  
  // Merge all route objects into main routes
  ...companyRouteObjects,
  ...contentEditorRouteObjects,
  ...insuranceRouteObjects,
  ...leadRouteObjects,
  ...marketplaceRouteObjects,
  ...featureRouteObjects,
];