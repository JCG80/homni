
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes as ReactRoutes } from 'react-router-dom';
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

export const AppRoutes = () => {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <ReactRoutes>
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
        </ReactRoutes>
      </Suspense>
    </Router>
  );
};
