
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Authenticated } from './components/Authenticated';
import { Unauthenticated } from './components/Unauthenticated';
import { HomePage } from './pages/HomePage';
import { UnauthorizedPage } from './modules/auth/pages/UnauthorizedPage';
import { AuthManagementPage } from './modules/auth/pages/AuthManagementPage';
import { ProtectedRoute } from './modules/auth/components/ProtectedRoute';
import { CompanyProfilePage } from './modules/company/pages/CompanyProfilePage';
import { LeadCapturePage } from './modules/leads/pages/LeadCapturePage';
import { LeadManagementPage } from './modules/leads/pages/LeadManagementPage';
import { LeadSettingsPage } from './modules/leads/pages/LeadSettingsPage';
import { ProjectPlanPage } from './modules/docs/pages/ProjectPlanPage';
import { docsRoutes } from './modules/docs/routes';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PowerComparisonPage } from './pages/PowerComparisonPage';
import { ProfilePage } from './modules/auth/pages/ProfilePage';
import { PropertiesPage } from './modules/property/pages/PropertiesPage';
import { PropertyDetailsPage } from './modules/property/pages/PropertyDetailsPage';
import { ServiceSelectionPage } from './modules/services/pages/ServiceSelectionPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public pages accessible to everyone */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/strom" element={<PowerComparisonPage />} />
      <Route path="/tjenester" element={<ServiceSelectionPage />} />
      
      {/* Redirect from /strøm to /strom for consistency */}
      <Route path="/strøm" element={<Navigate to="/strom" replace />} />
      
      {/* Protected pages requiring authentication */}
      <Route path="/dashboard" element={
        <Authenticated>
          <HomePage />
        </Authenticated>
      } />
      
      {/* User profile page */}
      <Route path="/profile" element={
        <Authenticated>
          <ProfilePage />
        </Authenticated>
      } />
      
      {/* Property management pages */}
      <Route path="/properties" element={
        <Authenticated>
          <PropertiesPage />
        </Authenticated>
      } />
      
      <Route path="/properties/:propertyId" element={
        <Authenticated>
          <PropertyDetailsPage />
        </Authenticated>
      } />
      
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      
      {/* Auth management - only for admins */}
      <Route path="/auth-management" element={
        <Authenticated>
          <ProtectedRoute allowedRoles={['admin', 'master_admin']}>
            <AuthManagementPage />
          </ProtectedRoute>
        </Authenticated>
      } />

      {/* Company profile - only for companies */}
      <Route path="/company-profile" element={
        <Authenticated>
          <ProtectedRoute allowedRoles={['company']}>
            <CompanyProfilePage />
          </ProtectedRoute>
        </Authenticated>
      } />

      {/* Lead capture - accessible to all authenticated users */}
      <Route path="/lead-capture" element={
        <Authenticated>
          <ProtectedRoute allowAnyAuthenticated={true}>
            <LeadCapturePage />
          </ProtectedRoute>
        </Authenticated>
      } />

      {/* Lead management - only for admins and companies */}
      <Route path="/lead-management" element={
        <Authenticated>
          <ProtectedRoute allowedRoles={['admin', 'master_admin', 'company']}>
            <LeadManagementPage />
          </ProtectedRoute>
        </Authenticated>
      } />

      {/* Lead settings - only for admins */}
      <Route path="/lead-settings" element={
        <Authenticated>
          <ProtectedRoute allowedRoles={['admin', 'master_admin']}>
            <LeadSettingsPage />
          </ProtectedRoute>
        </Authenticated>
      } />
      
      {/* Documentation routes */}
      {docsRoutes}
      
      {/* Catch-all route to redirect to landing page */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}
