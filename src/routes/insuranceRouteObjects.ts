import { lazy, createElement } from 'react';
import type { AppRoute } from './routeTypes';

// Lazy-loaded insurance pages
const CompanyListPage = lazy(() => import('@/modules/insurance/pages/CompanyListPage').then(m => ({ default: m.CompanyListPage })));
const CompanyDetailsPage = lazy(() => import('@/modules/insurance/pages/CompanyDetailsPage').then(m => ({ default: m.CompanyDetailsPage })));
const InsuranceQuotePage = lazy(() => import('@/modules/insurance/pages/InsuranceQuotePage').then(m => ({ default: m.InsuranceQuotePage })));
const InsuranceComparisonPage = lazy(() => import('@/modules/insurance/pages/InsuranceComparisonPage').then(m => ({ default: m.InsuranceComparisonPage })));

export const insuranceRouteObjects: AppRoute[] = [
  {
    path: '/insurance/companies',
    element: createElement(CompanyListPage),
    roles: ['user', 'company', 'admin', 'master_admin'],
    navKey: 'insurance-companies'
  },
  {
    path: '/insurance/companies/:companyId',
    element: createElement(CompanyDetailsPage), 
    roles: ['user', 'company', 'admin', 'master_admin'],
    navKey: 'insurance-company-details'
  },
  {
    path: '/insurance/quote',
    element: createElement(InsuranceQuotePage),
    roles: ['user', 'company', 'admin', 'master_admin'],
    navKey: 'insurance-quote'
  },
  {
    path: '/insurance/compare',
    element: createElement(InsuranceComparisonPage),
    roles: ['user', 'company', 'admin', 'master_admin'],
    navKey: 'insurance-compare'
  }
];