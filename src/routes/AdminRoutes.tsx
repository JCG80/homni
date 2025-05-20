
import React from 'react';
import { Route } from 'react-router-dom';
import { RoleDashboard } from '../components/dashboard/RoleDashboard';
import { CompaniesManagementPage } from '../modules/admin/pages/CompaniesManagementPage';
import { MembersManagementPage } from '../modules/admin/pages/MembersManagementPage';
import { InternalAccessPage } from '../modules/admin/pages/InternalAccessPage';
import { RoleManagementPage } from '../modules/admin/pages/RoleManagementPage';
import { SystemModulesPage } from '../modules/system/pages/SystemModulesPage';

export const AdminRoutes = () => {
  return (
    <>
      <Route path="/admin/companies" element={
        <RoleDashboard title="Bedrifter" requiredRole={['admin', 'master_admin']}>
          <CompaniesManagementPage />
        </RoleDashboard>
      } />
      
      <Route path="/admin/members" element={
        <RoleDashboard title="Medlemmer" requiredRole={['admin', 'master_admin']}>
          <MembersManagementPage />
        </RoleDashboard>
      } />
      
      <Route path="/admin/roles" element={
        <RoleDashboard title="Rolleadministrasjon" requiredRole="master_admin">
          <RoleManagementPage />
        </RoleDashboard>
      } />
      
      <Route path="/admin/system-modules" element={
        <RoleDashboard title="Systemmoduler" requiredRole={['admin', 'master_admin']}>
          <SystemModulesPage />
        </RoleDashboard>
      } />
      
      <Route path="/admin/internal-access" element={
        <RoleDashboard title="Modultilgang" requiredRole="master_admin">
          <InternalAccessPage />
        </RoleDashboard>
      } />
    </>
  );
};
