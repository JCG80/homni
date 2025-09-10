/**
 * Core Module Routes - Unified cross-module navigation
 */
import { lazy, createElement } from 'react';
import type { AppRoute } from './routeTypes';

// Lazy load core module components
const UnifiedDashboard = lazy(() => 
  import('@/modules/core/UnifiedDashboard').then(m => ({ default: m.UnifiedDashboard }))
);
const ModuleIntegrationHub = lazy(() => 
  import('@/components/modules/ModuleIntegrationHub').then(m => ({ default: m.ModuleIntegrationHub }))
);

export const coreModuleRoutes: AppRoute[] = [
  {
    path: '/unified-dashboard',
    element: createElement(UnifiedDashboard),
    roles: ['user', 'company', 'content_editor', 'admin', 'master_admin'],
    navKey: 'unified-dashboard'
  },
  {
    path: '/integrations',
    element: createElement(ModuleIntegrationHub),
    roles: ['user', 'company', 'content_editor', 'admin', 'master_admin'],
    navKey: 'integrations'
  },
  {
    path: '/modules',
    element: createElement(ModuleIntegrationHub),
    roles: ['user', 'company', 'content_editor', 'admin', 'master_admin'],
    navKey: 'modules'
  }
];