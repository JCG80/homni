/**
 * Business module routes for Lead Engine, Property Management, and DIY Selling
 */

import React from 'react';
import { Route } from 'react-router-dom';
import { RoleDashboard } from '../components/dashboard/RoleDashboard';
import { LeadEngineInterface } from '../modules/leads/components/LeadEngineInterface';
import { PropertyManagementInterface } from '../modules/property/components/PropertyManagementInterface';
import { DIYSellingInterface } from '../modules/sales/components/DIYSellingInterface';

export const businessRoutes = (
  <>
    {/* Lead Engine Routes */}
    <Route path="/leads" element={
      <RoleDashboard title="Lead Engine" requiredRole={['user', 'company']}>
        <LeadEngineInterface />
      </RoleDashboard>
    } />
    
    <Route path="/leads/manage" element={
      <RoleDashboard title="Lead Management" requiredRole="company">
        <LeadEngineInterface />
      </RoleDashboard>
    } />

    {/* Property Management Routes */}
    <Route path="/property" element={
      <RoleDashboard title="Eiendomsforvaltning" requiredRole={['user', 'company']}>
        <PropertyManagementInterface />
      </RoleDashboard>
    } />
    
    <Route path="/property/portfolio" element={
      <RoleDashboard title="Eiendoms Portefølje" requiredRole="company">
        <PropertyManagementInterface />
      </RoleDashboard>
    } />
    
    <Route path="/property/documents" element={
      <RoleDashboard title="Eiendomsdokumenter" requiredRole={['user', 'company']}>
        <PropertyManagementInterface />
      </RoleDashboard>
    } />
    
    <Route path="/property/expenses" element={
      <RoleDashboard title="Eiendomsutgifter" requiredRole={['user', 'company']}>
        <PropertyManagementInterface />
      </RoleDashboard>
    } />

    {/* DIY Selling Routes */}
    <Route path="/sales" element={
      <RoleDashboard title="DIY Salg" requiredRole={['user', 'company']}>
        <DIYSellingInterface />
      </RoleDashboard>
    } />
    
    <Route path="/sales/setup" element={
      <RoleDashboard title="Salgsoppsett" requiredRole={['user', 'company']}>
        <DIYSellingInterface />
      </RoleDashboard>
    } />
    
    <Route path="/sales/marketing" element={
      <RoleDashboard title="Salgsmarkedsføring" requiredRole={['user', 'company']}>
        <DIYSellingInterface />
      </RoleDashboard>
    } />
    
    <Route path="/sales/manage" element={
      <RoleDashboard title="Salgsadministrasjon" requiredRole={['user', 'company']}>
        <DIYSellingInterface />
      </RoleDashboard>
    } />
    
    <Route path="/sales/pipeline" element={
      <RoleDashboard title="Salg Pipeline" requiredRole="company">
        <DIYSellingInterface />
      </RoleDashboard>
    } />
  </>
);