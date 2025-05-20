
import React from 'react';
import { MainRoutes } from './MainRoutes';
import { AuthenticatedRoutes } from './AuthenticatedRoutes';
import { DashboardRoutes } from './DashboardRoutes';
import { AdminRoutes } from './AdminRoutes';
import { ModuleRoutes } from './ModuleRoutes';
import { DocsRoutes } from './DocsRoutes';

/**
 * Aggregates all application routes
 */
export const AppRouteComponents = () => (
  <>
    <MainRoutes />
    <AuthenticatedRoutes />
    <DashboardRoutes />
    <AdminRoutes />
    <ModuleRoutes />
    <DocsRoutes />
  </>
);
