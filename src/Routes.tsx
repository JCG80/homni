
import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import MyAccountPage from './pages/MyAccountPage';
import { LeadCapturePage } from './modules/leads/pages/LeadCapturePage';
import { LeadManagementPage } from './modules/leads/pages/LeadManagementPage';
import { ProfilePage } from './modules/auth/pages/ProfilePage';
import { CompanyProfilePage } from './modules/company/pages/CompanyProfilePage';
import { AdminLeadsPage } from './modules/leads/pages/AdminLeadsPage';
import { LeadSettingsPage } from './modules/leads/pages/LeadSettingsPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { InsuranceRequestSuccessPage } from './pages/InsuranceRequestSuccessPage';
import { ProtectedRoute } from './modules/auth/components/ProtectedRoute';
import { PowerComparisonPage } from './pages/PowerComparisonPage';
import { InsuranceQuotePage } from './modules/insurance/pages/InsuranceQuotePage';

export const AppRoutes = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route 
          path="/my-account" 
          element={
            <ProtectedRoute allowAnyAuthenticated>
              <MyAccountPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/lead-capture" element={<LeadCapturePage />} />
        <Route path="/leads" element={<LeadManagementPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/company/profile" element={<CompanyProfilePage />} />
        <Route path="/admin/leads" element={<AdminLeadsPage />} />
        <Route path="/admin/settings" element={<LeadSettingsPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/insurance-request-success" element={<InsuranceRequestSuccessPage />} />
        <Route path="/strom" element={<PowerComparisonPage />} />
        <Route path="/forsikring" element={<InsuranceQuotePage />} />
      </Routes>
    </Suspense>
  );
};
