#!/usr/bin/env tsx
/**
 * Convert Insurance JSX routes to Route Objects (Zero-Dupes Phase B)
 * Following Route Objects Standard for lazy loading and navigation integrity
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

// Insurance Route Objects (converting from JSX)
const insuranceRouteObjectsContent = `import { lazy, createElement } from 'react';
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
    breadcrumbs: [
      { label: 'Forsikring', href: '/insurance/companies' }
    ],
    navKey: 'insurance-companies'
  },
  {
    path: '/insurance/companies/:companyId',
    element: createElement(CompanyDetailsPage),
    roles: ['user', 'company', 'admin', 'master_admin'],
    breadcrumbs: [
      { label: 'Forsikring', href: '/insurance/companies' },
      { label: 'Selskap', href: '#' }
    ],
    navKey: 'insurance-company-details'
  },
  {
    path: '/insurance/quote',
    element: createElement(InsuranceQuotePage),
    roles: ['user', 'company', 'admin', 'master_admin'],
    breadcrumbs: [
      { label: 'Forsikring', href: '/insurance/companies' },
      { label: 'Tilbud', href: '/insurance/quote' }
    ],
    navKey: 'insurance-quote'
  },
  {
    path: '/insurance/compare',
    element: createElement(InsuranceComparisonPage),
    roles: ['user', 'company', 'admin', 'master_admin'],
    breadcrumbs: [
      { label: 'Forsikring', href: '/insurance/companies' },
      { label: 'Sammenlign', href: '/insurance/compare' }
    ],
    navKey: 'insurance-compare'
  }
];`;

// Admin Insurance Route Objects  
const adminInsuranceRouteObjectsContent = `import { lazy, createElement } from 'react';
import type { AppRoute } from './routeTypes';

// Lazy-loaded admin insurance pages
const AdminInsuranceCompaniesPage = lazy(() => import('@/modules/insurance/pages/AdminInsuranceCompaniesPage').then(m => ({ default: m.AdminInsuranceCompaniesPage })));
const AdminInsuranceTypesPage = lazy(() => import('@/modules/insurance/pages/AdminInsuranceTypesPage').then(m => ({ default: m.AdminInsuranceTypesPage })));
const AdminCompanyTypesPage = lazy(() => import('@/modules/insurance/pages/AdminCompanyTypesPage').then(m => ({ default: m.AdminCompanyTypesPage })));
const AdminDetachedBuildingsPage = lazy(() => import('@/modules/insurance/pages/AdminDetachedBuildingsPage').then(m => ({ default: m.AdminDetachedBuildingsPage })));

export const adminInsuranceRouteObjects: AppRoute[] = [
  {
    path: '/admin/insurance/companies',
    element: createElement(AdminInsuranceCompaniesPage),
    roles: ['admin', 'master_admin'],
    breadcrumbs: [
      { label: 'Admin', href: '/admin/dashboard' },
      { label: 'Forsikringsselskaper', href: '/admin/insurance/companies' }
    ],
    navKey: 'admin-insurance-companies'
  },
  {
    path: '/admin/insurance/types', 
    element: createElement(AdminInsuranceTypesPage),
    roles: ['admin', 'master_admin'],
    breadcrumbs: [
      { label: 'Admin', href: '/admin/dashboard' },
      { label: 'Forsikringstyper', href: '/admin/insurance/types' }
    ],
    navKey: 'admin-insurance-types'
  },
  {
    path: '/admin/insurance/companies/:companyId/types',
    element: createElement(AdminCompanyTypesPage),
    roles: ['admin', 'master_admin'],
    breadcrumbs: [
      { label: 'Admin', href: '/admin/dashboard' },
      { label: 'Forsikringsselskaper', href: '/admin/insurance/companies' },
      { label: 'Typer', href: '#' }
    ],
    navKey: 'admin-company-types'
  },
  {
    path: '/admin/insurance/buildings',
    element: createElement(AdminDetachedBuildingsPage),
    roles: ['admin', 'master_admin'],
    breadcrumbs: [
      { label: 'Admin', href: '/admin/dashboard' },
      { label: 'Bygninger', href: '/admin/insurance/buildings' }
    ],
    navKey: 'admin-detached-buildings'
  }
];`;

function main() {
  console.log('🔧 Creating insurance route objects...\n');
  
  try {
    // Create route objects files
    const routesDir = join(process.cwd(), 'src', 'routes');
    
    writeFileSync(
      join(routesDir, 'insuranceRouteObjects.ts'),
      insuranceRouteObjectsContent
    );
    
    writeFileSync(
      join(routesDir, 'adminInsuranceRouteObjects.ts'),
      adminInsuranceRouteObjectsContent
    );
    
    console.log('✅ Created src/routes/insuranceRouteObjects.ts');
    console.log('✅ Created src/routes/adminInsuranceRouteObjects.ts');
    console.log('\n🎉 Insurance routes converted to Route Objects Standard');
    console.log('📋 Features added:');
    console.log('  - Lazy loading with Suspense');
    console.log('  - Role-based access control');
    console.log('  - Norwegian breadcrumb navigation');
    console.log('  - Navigation keys for UI integration');
    
  } catch (error) {
    console.error('❌ Error creating route objects:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}