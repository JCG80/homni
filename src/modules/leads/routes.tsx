
import React from 'react';
import { Route } from 'react-router-dom';
import { LeadManagementPage } from './pages/LeadManagementPage';
import { LeadDetailsPage } from './pages/LeadDetailsPage';
import { LeadCapturePage } from './pages/LeadCapturePage';
import { LeadSettingsPage } from './pages/LeadSettingsPage';
import { LeadReportsPage } from './pages/LeadReportsPage';
import { LeadTestPage } from './pages/LeadTestPage';
import { AdminLeadsPage } from './pages/AdminLeadsPage';
import { LeadKanbanPage } from './pages/LeadKanbanPage';

export const leadRoutes = (
  <>
    <Route path="/leads" element={<LeadManagementPage />} />
    <Route path="/leads/kanban" element={<LeadKanbanPage />} />
    <Route path="/leads/:id" element={<LeadDetailsPage />} />
    <Route path="/lead-capture" element={<LeadCapturePage />} />
    <Route path="/lead-settings" element={<LeadSettingsPage />} />
    <Route path="/lead-reports" element={<LeadReportsPage />} />
    <Route path="/lead-test" element={<LeadTestPage />} />
    <Route path="/admin/leads" element={<AdminLeadsPage />} />
  </>
);
