
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { RoleDashboard } from '../components/dashboard/RoleDashboard';
import { LeadsOffersDashboard } from '../components/dashboard/LeadsOffersDashboard';
import { AppLayout } from '../components/layout/AppLayout';
import { mainRoutes } from './mainRoutes';
import { userRoutes } from './userRoutes';
import { companyRoutes } from './companyRoutes';
import { adminRoutes } from './adminRoutes';
import { leadRoutes } from './leadRoutes';
import { docsRoutes } from './docsRoutes';
import { serviceRoutes } from './serviceRoutes';
import { marketplaceRoutes } from './marketplaceRoutes';



/**
 * Main application routes component that combines all route definitions
 */
export const AppRouteComponents = () => {
  console.log("AppRouteComponents - Rendering all routes");
  
  return (
    <Routes>
      {/* Public routes - no authentication required */}
      {mainRoutes}
      
      {/* Authenticated routes with minimal layout */}
      <Route path="dashboard" element={
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
          <div className="space-y-4">
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">Tilgjengelige dashboards:</h3>
              <div className="space-y-2">
                <a href="/dashboard/admin" className="block p-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                  Admin Dashboard - For admin og master admin brukere
                </a>
                <a href="/profile" className="block p-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90">
                  Min Profil - Personlig profilside
                </a>
              </div>
            </div>
          </div>
        </div>
      } />
      <Route path="profile" element={
        <RoleDashboard title="Min profil" allowAnyAuthenticated={true}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Min profil</h2>
            <p>Profilside kommer snart...</p>
          </div>
        </RoleDashboard>
      } />
      
      {/* Role-based routes */}
      {userRoutes}
      {companyRoutes}
      {adminRoutes}
      {leadRoutes}
      {docsRoutes}
      {serviceRoutes}
      {marketplaceRoutes}
    </Routes>
  );
};
