
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { RoleDashboard } from '../components/dashboard/RoleDashboard';
import { Dashboard } from '../pages/Dashboard';
import { AppLayout } from '../components/layout/AppLayout';
import { mainRoutes } from './mainRoutes';
import { userRoutes } from './userRoutes';
import { companyRoutes } from './companyRoutes';
import { adminRoutes } from './adminRoutes';
import { leadRoutes } from './leadRoutes';
import { docsRoutes } from './docsRoutes';
import { serviceRoutes } from './serviceRoutes';
import { marketplaceRoutes } from './marketplaceRoutes';


/**
 * Main application routes component that combines all route definitions
 */
export const AppRouteComponents = () => {
  console.log("AppRouteComponents - Rendering all routes");
  
  return (
    <Routes>
      {/* Public routes */}
      {mainRoutes}
      
      {/* Authenticated routes with AppLayout */}
      <Route element={<AppLayout />}>
        <Route path="dashboard" element={
          <RoleDashboard title="Dashboard" allowAnyAuthenticated={true}>
            <Dashboard />
          </RoleDashboard>
        } />
        
        <Route path="dashboard/user" element={
          <RoleDashboard title="Bruker Dashboard" requiredRole="user">
            <Dashboard />
          </RoleDashboard>
        } />
        
        <Route path="dashboard/company" element={
          <RoleDashboard title="Bedrift Dashboard" requiredRole="company">
            <Dashboard />
          </RoleDashboard>
        } />
        
        <Route path="dashboard/content-editor" element={
          <RoleDashboard title="Content Editor" requiredRole="content_editor">
            <Dashboard />
          </RoleDashboard>
        } />
        
        <Route path="dashboard/admin" element={
          <RoleDashboard title="Admin Dashboard" requiredRole={['admin', 'master_admin']}>
            <Dashboard />
          </RoleDashboard>
        } />
        
        <Route path="admin" element={
          <RoleDashboard title="Admin Dashboard" requiredRole={['admin', 'master_admin']}>
            <Dashboard />
          </RoleDashboard>
        } />
        
        {/* Service routes */}
        {serviceRoutes}
        
        {/* Documentation routes */}
        {docsRoutes}
        
        {/* User routes (require authentication) */}
        {userRoutes}
        
        {/* Company routes (require authentication + company role) */}
        {companyRoutes}
        
        {/* Lead management routes */}
        {leadRoutes}
        
        {/* Marketplace routes */}
        {marketplaceRoutes}
        
        {/* Admin routes (require authentication + admin/master_admin role) */}
        {adminRoutes}
      </Route>
    </Routes>
  );
};
