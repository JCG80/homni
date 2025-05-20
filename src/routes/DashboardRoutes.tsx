
import React from 'react';
import { Route } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import {
  MemberDashboard,
  CompanyDashboard,
  AdminDashboard,
  MasterAdminDashboard,
  ContentEditorDashboard
} from '@/pages/dashboard';

/**
 * Dashboard routes for all user roles
 */
export const DashboardRoutes = () => (
  <>
    {/* Main dashboard route - redirects to role-specific dashboard */}
    <Route path="/dashboard" element={
      <ProtectedRoute allowAnyAuthenticated>
        <Dashboard />
      </ProtectedRoute>
    } />
    
    {/* Role-specific dashboard routes */}
    <Route path="/dashboard/member" element={
      <ProtectedRoute allowedRoles={['member']}>
        <MemberDashboard />
      </ProtectedRoute>
    } />
    
    <Route path="/dashboard/company" element={
      <ProtectedRoute allowedRoles={['company']}>
        <CompanyDashboard />
      </ProtectedRoute>
    } />
    
    <Route path="/dashboard/admin" element={
      <ProtectedRoute allowedRoles={['admin', 'master_admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    } />
    
    <Route path="/dashboard/master_admin" element={
      <ProtectedRoute allowedRoles={['master_admin']}>
        <MasterAdminDashboard />
      </ProtectedRoute>
    } />
    
    <Route path="/dashboard/content_editor" element={
      <ProtectedRoute allowedRoles={['content_editor', 'admin', 'master_admin']}>
        <ContentEditorDashboard />
      </ProtectedRoute>
    } />
  </>
);
