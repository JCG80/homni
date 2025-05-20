
import React from 'react';
import { Routes } from 'react-router-dom';
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
  <Routes>
    <MainRoutes />
    <AuthenticatedRoutes />
    <DashboardRoutes />
    <AdminRoutes />
    <ModuleRoutes />
    <DocsRoutes />
  </Routes>
);
