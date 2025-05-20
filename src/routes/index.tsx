
import React from 'react';
import { Routes } from 'react-router-dom';
import { MainRoutes } from './MainRoutes';
import { AuthenticatedRoutes } from './AuthenticatedRoutes';
import { DashboardRoutes } from './DashboardRoutes';
import { ModuleRoutes } from './ModuleRoutes';
import { DocsRoutes } from './DocsRoutes';
import { AdminRoutes } from './AdminRoutes';
import { useAuth } from '../modules/auth/hooks';

export const AppRouteComponents = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      {/* Main routes (accessible to all) */}
      <MainRoutes />
      
      {/* Module routes (services, features, etc.) */}
      <ModuleRoutes />
      
      {/* Documentation routes */}
      <DocsRoutes />
      
      {/* Routes that require authentication */}
      {isAuthenticated && (
        <>
          <AuthenticatedRoutes />
          <DashboardRoutes />
          <AdminRoutes />
        </>
      )}
    </Routes>
  );
};
