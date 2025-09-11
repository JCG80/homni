import { lazy, createElement } from 'react';
import type { AppRoute } from './routeTypes';

// Lazy-loaded feature pages behind feature flags
const PropertyPage = lazy(() => import('@/pages/PropertyPage'));
const PropertyDetailsPage = lazy(() => import('@/modules/property/pages/PropertyDetailsPage').then(m => ({ default: m.PropertyDetailsPage })));
const DIYSalesPage = lazy(() => import('@/pages/DIYSalesPage').then(m => ({ default: m.DIYSalesPage })));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const CompanyAnalyticsPage = lazy(() => import('@/pages/CompanyAnalyticsPage').then(m => ({ default: m.CompanyAnalyticsPage })));
const AdminAnalyticsPage = lazy(() => import('@/pages/AdminAnalyticsPage').then(m => ({ default: m.AdminAnalyticsPage })));

export const featureRouteObjects: AppRoute[] = [
  {
    path: '/property',
    element: createElement(PropertyPage),
    roles: ['user', 'company', 'admin', 'master_admin'],
    flag: 'ENABLE_PROPERTY_MANAGEMENT',
    navKey: 'property'
  },
  {
    path: '/property/:id',
    element: createElement(PropertyDetailsPage),
    roles: ['user', 'company', 'admin', 'master_admin'],
    flag: 'ENABLE_PROPERTY_MANAGEMENT',
    navKey: 'property-details'
  },
  {
    path: '/diy-sales',
    element: createElement(DIYSalesPage),
    roles: ['user', 'company', 'admin', 'master_admin'],
    flag: 'ENABLE_DIY_SALES',
    navKey: 'diy-sales'
  },
  {
    path: '/analytics',
    element: createElement(AnalyticsPage),
    roles: ['user', 'company', 'admin', 'master_admin'],
    flag: 'ENABLE_ANALYTICS_DASHBOARD',
    navKey: 'analytics'
  },
  {
    path: '/company-analytics',
    element: createElement(CompanyAnalyticsPage),
    roles: ['company', 'admin', 'master_admin'],
    flag: 'ENABLE_ANALYTICS_DASHBOARD',
    navKey: 'company-analytics'
  },
  {
    path: '/admin-analytics',
    element: createElement(AdminAnalyticsPage),
    roles: ['admin', 'master_admin'],
    flag: 'ENABLE_ANALYTICS_DASHBOARD',
    navKey: 'admin-analytics'
  }
];