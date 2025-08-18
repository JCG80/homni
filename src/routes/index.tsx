
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { RoleDashboard } from '../components/dashboard/RoleDashboard';
import { Dashboard } from '../pages/Dashboard';
import { mainRoutes } from './mainRoutes';
import { memberRoutes } from './memberRoutes';
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
      
      {/* Dashboard routes (role-based) - SIMPLIFIED TO REDUCE CONFLICTS */}
      <Route path="/dashboard" element={
        <RoleDashboard title="Dashboard" allowAnyAuthenticated={true}>
          <Dashboard />
        </RoleDashboard>
      } />
      
      <Route path="/dashboard/user" element={
        <RoleDashboard title="Bruker Dashboard" requiredRole="user">
          <Dashboard />
        </RoleDashboard>
      } />
      
      <Route path="/dashboard/company" element={
        <RoleDashboard title="Bedrift Dashboard" requiredRole="company">
          <Dashboard />
        </RoleDashboard>
      } />
      
      <Route path="/dashboard/content-editor" element={
        <RoleDashboard title="Content Editor" requiredRole="content_editor">
          <Dashboard />
        </RoleDashboard>
      } />
      
      {/* Service routes */}
      {serviceRoutes}
      
      {/* Documentation routes */}
      {docsRoutes}
      
      {/* Member routes (require authentication) */}
      {memberRoutes}
      
      {/* Company routes (require authentication + company role) */}
      {companyRoutes}
      
      {/* Lead management routes */}
      {leadRoutes}
      
      {/* Marketplace routes */}
      {marketplaceRoutes}
      
      {/* Admin routes (require authentication + admin/master_admin role) */}
      {adminRoutes}
    </Routes>
  );
};
