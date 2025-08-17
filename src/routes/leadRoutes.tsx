
import React from 'react';
import { Route } from 'react-router-dom';
import { LeadManagementPage } from '@/modules/leads/pages/LeadManagementPage';
import { LeadDetailsPage } from '@/modules/leads/pages/LeadDetailsPage';
import { LeadCapturePage } from '@/modules/leads/pages/LeadCapturePage';
import { LeadSettingsPage } from '@/modules/leads/pages/LeadSettingsPage';
import { LeadReportsPage } from '@/modules/leads/pages/LeadReportsPage';
import { LeadTestPage } from '@/modules/leads/pages/LeadTestPage';
import { LeadKanbanPage } from '@/modules/leads/pages/LeadKanbanPage';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';

/**
 * Routes for lead management features accessible by different roles
 */
export const leadRoutes = (
  <>
    <Route 
      path="/leads" 
      element={
        <RoleDashboard title="Forespørsler" requiredRole={["user", "company", "admin", "master_admin"]}>
          <LeadManagementPage />
        </RoleDashboard>
      } 
    />
    <Route 
      path="/leads/kanban" 
      element={
        <RoleDashboard title="Kanban-tavle" requiredRole={["user", "company", "admin", "master_admin"]}>
          <LeadKanbanPage />
        </RoleDashboard>
      } 
    />
    <Route 
      path="/leads/:id" 
      element={
        <RoleDashboard title="Forespørselsdetaljer" requiredRole={["user", "company", "admin", "master_admin"]}>
          <LeadDetailsPage />
        </RoleDashboard>
      } 
    />
    <Route path="/lead-capture" element={<LeadCapturePage />} />
    <Route 
      path="/lead-settings" 
      element={
        <RoleDashboard title="Innstillinger" requiredRole={["admin", "master_admin"]}>
          <LeadSettingsPage />
        </RoleDashboard>
      } 
    />
    <Route 
      path="/lead-reports" 
      element={
        <RoleDashboard title="Rapporter" requiredRole={["admin", "master_admin"]}>
          <LeadReportsPage />
        </RoleDashboard>
      } 
    />
    <Route 
      path="/lead-test" 
      element={
        <RoleDashboard title="Test" requiredRole={["admin", "master_admin"]}>
          <LeadTestPage />
        </RoleDashboard>
      } 
    />
  </>
);
