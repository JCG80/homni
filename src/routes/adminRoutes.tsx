
import React from 'react';
import { Route } from 'react-router-dom';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { CompaniesManagementPage } from '@/modules/admin/pages/CompaniesManagementPage';
import { MembersManagementPage } from '@/modules/admin/pages/MembersManagementPage';
import { SystemModulesPage } from '@/modules/system/pages/SystemModulesPage';
import { RoleManagementPage } from '@/modules/admin/pages/RoleManagementPage';
import { InternalAccessPage } from '@/modules/admin/pages/InternalAccessPage';
import { AdminLeadsPage } from '@/modules/leads/pages/AdminLeadsPage';

/**
 * Routes specifically for admin and master_admin users
 */
export const adminRoutes = (
  <>
    {/* Admin Dashboard */}
    <Route 
      path="/dashboard/admin" 
      element={
        <RoleDashboard title="Admin Dashboard" requiredRole={['admin', 'master_admin']}>
          <SystemModulesPage />
        </RoleDashboard>
      } 
    />
    
    {/* Admin - Companies Management */}
    <Route 
      path="/admin/companies" 
      element={
        <RoleDashboard title="Bedrifter" requiredRole={['admin', 'master_admin']}>
          <CompaniesManagementPage />
        </RoleDashboard>
      } 
    />
    
    {/* Admin - Members Management */}
    <Route 
      path="/admin/members" 
      element={
        <RoleDashboard title="Medlemmer" requiredRole={['admin', 'master_admin']}>
          <MembersManagementPage />
        </RoleDashboard>
      } 
    />
    
    {/* Admin - System Modules */}
    <Route 
      path="/admin/system-modules" 
      element={
        <RoleDashboard title="Systemmoduler" requiredRole={['admin', 'master_admin']}>
          <SystemModulesPage />
        </RoleDashboard>
      } 
    />
    
    {/* Admin - Leads */}
    <Route 
      path="/admin/leads" 
      element={
        <RoleDashboard title="Forespørsler" requiredRole={['admin', 'master_admin']}>
          <AdminLeadsPage />
        </RoleDashboard>
      } 
    />
    
    {/* Master Admin Only Routes */}
    <Route 
      path="/admin/roles" 
      element={
        <RoleDashboard title="Rolleadministrasjon" requiredRole="master_admin">
          <RoleManagementPage />
        </RoleDashboard>
      } 
    />
    
    <Route 
      path="/admin/internal-access" 
      element={
        <RoleDashboard title="Modultilgang" requiredRole="master_admin">
          <InternalAccessPage />
        </RoleDashboard>
      } 
    />
  </>
);
