import React from 'react';
import { Route } from 'react-router-dom';
import { RequireAuth } from '@/components/auth/RequireAuth';

// Leads management component
const LeadsManagement = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Leads Management</h1>
    <p className="text-muted-foreground mt-2">Manage your leads and opportunities</p>
  </div>
);

export const leadRoutes = [
  <Route 
    key="leads" 
    path="/leads" 
    element={
      <RequireAuth roles={['admin', 'master_admin', 'company']}>
        <LeadsManagement />
      </RequireAuth>
    } 
  />,
];