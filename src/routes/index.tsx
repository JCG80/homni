
import React from 'react';
import { Routes } from 'react-router-dom';
import { mainRoutes } from './mainRoutes';
import { memberRoutes } from './memberRoutes';
import { companyRoutes } from './companyRoutes';
import { adminRoutes } from './adminRoutes';
import { leadRoutes } from './leadRoutes';
import { docsRoutes } from './docsRoutes';
import { serviceRoutes } from './serviceRoutes';
import { dashboardRoutes } from './DashboardRoutes';

/**
 * Main application routes component that combines all route definitions
 */
export const AppRouteComponents = () => {
  console.log("AppRouteComponents - Rendering all routes");
  
  return (
    <Routes>
      {/* Public routes */}
      {mainRoutes}
      
      {/* Dashboard routes (role-based) */}
      {dashboardRoutes}
      
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
      
      {/* Admin routes (require authentication + admin/master_admin role) */}
      {adminRoutes}
    </Routes>
  );
};
