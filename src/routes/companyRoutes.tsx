import React from 'react';
import { Route } from 'react-router-dom';
import { RequireAuth } from '@/components/auth/RequireAuth';

// Company dashboard component
const CompanyDashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Company Dashboard</h1>
    <p className="text-muted-foreground mt-2">Welcome to your company dashboard</p>
  </div>
);

export const companyRoutes = [
  <Route 
    key="company-dashboard" 
    path="/dashboard/company" 
    element={
      <RequireAuth roles={['company']}>
        <CompanyDashboard />
      </RequireAuth>
    } 
  />,
];