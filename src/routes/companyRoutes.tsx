
import React from 'react';
import { Route } from 'react-router-dom';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';
import { Dashboard } from '@/pages/Dashboard';
import { CompanyListPage } from '@/modules/user/pages/CompanyListPage';

/**
 * Routes specifically for company users
 */
export const companyRoutes = (
  <>
    {/* Company Dashboard */}
    <Route 
      path="/dashboard/company" 
      element={
        <RoleDashboard title="Bedrift Dashboard" requiredRole="company">
          <Dashboard />
        </RoleDashboard>
      } 
    />
    
    {/* Companies List */}
    <Route 
      path="/companies" 
      element={<CompanyListPage />} 
    />
  </>
);
