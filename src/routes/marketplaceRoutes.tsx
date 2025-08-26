import React from 'react';
import { Route } from 'react-router-dom';
import { RoleDashboard } from '../components/dashboard/RoleDashboard';
import { MarketplaceDashboard } from '../pages/marketplace/MarketplaceDashboard';
import { PackageManagement } from '../pages/marketplace/PackageManagement';
import { BuyerManagement } from '../pages/marketplace/BuyerManagement';
import { LeadPipeline } from '../pages/marketplace/LeadPipeline';

export const marketplaceRoutes = (
  <>
    {/* Marketplace Dashboard - accessible to admins and companies */}
    <Route 
      path="marketplace" 
      element={
        <RoleDashboard title="Marketplace" requiredRole={["admin", "master_admin", "company"]}>
          <MarketplaceDashboard />
        </RoleDashboard>
      } 
    />
    
    {/* Package Management - admin only */}
    <Route 
      path="marketplace/package-management" 
      element={
        <RoleDashboard title="Package Management" requiredRole={["admin", "master_admin"]}>
          <PackageManagement />
        </RoleDashboard>
      } 
    />
    
    {/* Buyer Management - admin only */}
    <Route 
      path="marketplace/buyers" 
      element={
        <RoleDashboard title="Buyer Management" requiredRole={["admin", "master_admin"]}>
          <BuyerManagement />
        </RoleDashboard>
      } 
    />
    
    {/* Lead Pipeline - company users */}
    <Route 
      path="marketplace/pipeline" 
      element={
        <RoleDashboard title="Lead Pipeline" requiredRole="company">
          <LeadPipeline />
        </RoleDashboard>
      } 
    />
  </>
);