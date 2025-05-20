
import React from 'react';
import { Route } from 'react-router-dom';
import { RoleDashboard } from '../components/dashboard/RoleDashboard';
import { Dashboard } from '../pages/Dashboard';
import { UserRole } from '../modules/auth/utils/roles/types';

export const DashboardRoutes = () => {
  return (
    <>
      <Route path="/dashboard" element={
        <RoleDashboard title="Dashboard">
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
};
