import React from 'react';
import { Route } from 'react-router-dom';
import { RoleDashboard } from '../components/dashboard/RoleDashboard';
import { Dashboard } from '../pages/Dashboard';

/**
 * Dashboard routes with proper role-based access control
 */
export const dashboardRoutes = (
  <>
    {/* General dashboard - requires authentication, no specific role */}
    <Route path="/dashboard" element={
      <RoleDashboard title="Dashboard" requiredRole={["member", "company", "admin", "master_admin", "content_editor"]}>
        <Dashboard />
      </RoleDashboard>
    } />
    
    <Route path="/dashboard/member" element={
      <RoleDashboard title="Medlem Dashboard" requiredRole="member">
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
  </>
);