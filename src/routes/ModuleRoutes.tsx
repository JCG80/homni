
import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { InsuranceRoutes } from '@/modules/insurance/InsuranceRoutes';
import { LeadCapturePage } from '@/modules/leads/pages/LeadCapturePage';
import { LeadManagementPage } from '@/modules/leads/pages/LeadManagementPage';
import { LeadKanbanPage } from '@/modules/leads/pages/LeadKanbanPage';
import { CompanyProfilePage } from '@/modules/company/pages/CompanyProfilePage';
import { CompanyListPage } from '@/modules/user/pages/CompanyListPage';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';

/**
 * Routes for various feature modules
 */
export const ModuleRoutes = () => (
  <>
    {/* Insurance routes */}
    <Route path="/forsikring/*" element={<InsuranceRoutes />} />
    <Route path="/insurance/*" element={<Navigate to="/forsikring" replace />} />
    
    {/* Lead routes */}
    <Route path="/lead-capture" element={<LeadCapturePage />} />
    <Route path="/leads" element={
      <ProtectedRoute allowedRoles={['admin', 'master_admin', 'company', 'member']}>
        <LeadManagementPage />
      </ProtectedRoute>
    } />
    <Route path="/leads/kanban" element={<LeadKanbanPage />} />
    
    {/* Company routes */}
    <Route path="/company/profile" element={
      <ProtectedRoute allowedRoles={['company']}>
        <CompanyProfilePage />
      </ProtectedRoute>
    } />
    <Route path="/companies" element={<CompanyListPage />} />
  </>
);
