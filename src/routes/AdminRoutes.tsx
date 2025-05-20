
import React from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { AdminLeadsPage } from '@/modules/leads/pages/AdminLeadsPage';
import { LeadSettingsPage } from '@/modules/leads/pages/LeadSettingsPage';
import { FeatureFlagsAdminPage } from '@/modules/feature_flags/pages/FeatureFlagsAdminPage';
import { SystemModulesPage } from '@/modules/system/pages/SystemModulesPage';
import RoleManagementPage from '@/modules/admin/pages/RoleManagementPage';
import { MembersManagementPage } from '@/modules/admin/pages/MembersManagementPage';
import CompaniesManagementPage from '@/modules/admin/pages/CompaniesManagementPage';
import InternalAccessPage from '@/modules/admin/pages/InternalAccessPage';

/**
 * Admin-specific routes
 */
export const AdminRoutes = () => (
  <>
    <Route path="/admin/leads" element={
      <ProtectedRoute allowedRoles={['admin', 'master_admin']}>
        <AdminLeadsPage />
      </ProtectedRoute>
    } />
    
    <Route path="/admin/settings" element={
      <ProtectedRoute allowedRoles={['admin', 'master_admin']}>
        <LeadSettingsPage />
      </ProtectedRoute>
    } />

    <Route path="/admin/feature-flags" element={
      <ProtectedRoute allowedRoles={['admin', 'master_admin']}>
        <FeatureFlagsAdminPage />
      </ProtectedRoute>
    } />
    
    {/* System Modules route */}
    <Route path="/admin/system-modules" element={
      <ProtectedRoute allowedRoles={['admin', 'master_admin']}>
        <SystemModulesPage />
      </ProtectedRoute>
    } />
    
    {/* Role Management route - only accessible to master_admin */}
    <Route path="/admin/roles" element={
      <ProtectedRoute allowedRoles={['master_admin']}>
        <RoleManagementPage />
      </ProtectedRoute>
    } />
    
    {/* MasterAdmin User Management routes */}
    <Route path="/admin/members" element={
      <ProtectedRoute allowedRoles={['master_admin']}>
        <MembersManagementPage />
      </ProtectedRoute>
    } />
    
    <Route path="/admin/companies" element={
      <ProtectedRoute allowedRoles={['master_admin']}>
        <CompaniesManagementPage />
      </ProtectedRoute>
    } />
    
    <Route path="/admin/internal-access" element={
      <ProtectedRoute allowedRoles={['master_admin']}>
        <InternalAccessPage />
      </ProtectedRoute>
    } />
    
    {/* Content editor routes */}
    <Route path="/admin/content/*" element={
      <ProtectedRoute allowedRoles={['content_editor', 'admin', 'master_admin']}>
        <Navigate to="/dashboard/content_editor" replace />
      </ProtectedRoute>
    } />
  </>
);
