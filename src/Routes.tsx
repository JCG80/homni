
import React from 'react';
import { Route, Routes } from 'react-router-dom';
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

export function AppRoutes() {
  return (
    <Routes>
      {/* Offentlige sider som er tilgjengelig for alle */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/strom" element={<PowerComparisonPage />} />
      <Route path="/strøm" element={<PowerComparisonPage />} />
      
      {/* Beskyttede sider som krever innlogging */}
      <Route path="/dashboard" element={
        <Authenticated>
          <HomePage />
        </Authenticated>
      } />
      
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      
      {/* Auth management - only for admins */}
      <Route path="/auth-management" element={
        <Authenticated>
          <ProtectedRoute allowedRoles={['admin', 'master-admin']}>
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
          <ProtectedRoute allowedRoles={['admin', 'master-admin', 'company']}>
            <LeadManagementPage />
          </ProtectedRoute>
        </Authenticated>
      } />

      {/* Lead settings - only for admins */}
      <Route path="/lead-settings" element={
        <Authenticated>
          <ProtectedRoute allowedRoles={['admin', 'master-admin']}>
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
