import React, { Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
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
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { InsuranceRoutes } from './modules/insurance/InsuranceRoutes';
import NotFound from './pages/NotFound';
import { ServiceSelectionPage } from './modules/services/pages/ServiceSelectionPage';
import { CompanyListPage } from './modules/user/pages/CompanyListPage';
import { UserRole } from './modules/auth/utils/roles';
import RoleManagementPage from './modules/admin/pages/RoleManagementPage';

// Import SystemModulesPage
import { SystemModulesPage } from './modules/system/pages/SystemModulesPage';

// Import MasterAdmin management pages
import { MembersManagementPage } from './modules/admin/pages/MembersManagementPage';
import CompaniesManagementPage from './modules/admin/pages/CompaniesManagementPage';
import InternalAccessPage from './modules/admin/pages/InternalAccessPage';

// Import the dashboard pages
import { MemberDashboardPage } from './pages/dashboard/member';
import { CompanyDashboardPage } from './pages/dashboard/company';
import { AdminDashboardPage } from './pages/dashboard/admin';
import { MasterAdminDashboardPage } from './pages/dashboard/master_admin';
import { ContentEditorDashboardPage } from './pages/dashboard/content_editor';

export const AppRoutes = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Laster inn...</p>
        </div>
      </div>
    }>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* Service comparison routes */}
        <Route path="/strom" element={<PowerComparisonPage />} />
        <Route path="/compare" element={<InsuranceQuotePage />} />
        <Route path="/forsikring/*" element={<InsuranceRoutes />} />
        {/* Redirect from English route to Norwegian route */}
        <Route path="/insurance/*" element={<Navigate to="/forsikring" replace />} />
        <Route path="/insurance-request-success" element={<InsuranceRequestSuccessPage />} />
        
        {/* Lead capture public route */}
        <Route path="/lead-capture" element={<LeadCapturePage />} />
        
        {/* Companies list route */}
        <Route path="/companies" element={<CompanyListPage />} />
        
        {/* Dashboard routes based on role */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowAnyAuthenticated>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/member" element={
          <ProtectedRoute allowedRoles={['member'] as UserRole[]}>
            <MemberDashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/company" element={
          <ProtectedRoute allowedRoles={['company'] as UserRole[]}>
            <CompanyDashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/admin" element={
          <ProtectedRoute allowedRoles={['admin', 'master_admin'] as UserRole[]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/master_admin" element={
          <ProtectedRoute allowedRoles={['master_admin'] as UserRole[]}>
            <MasterAdminDashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/content_editor" element={
          <ProtectedRoute allowedRoles={['content_editor', 'admin', 'master_admin'] as UserRole[]}>
            <ContentEditorDashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/my-account" element={
          <ProtectedRoute allowedRoles={['member', 'company', 'admin', 'master_admin'] as UserRole[]}>
            <MyAccountPage />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute allowAnyAuthenticated>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/select-services" element={
          <ProtectedRoute allowAnyAuthenticated>
            <ServiceSelectionPage />
          </ProtectedRoute>
        } />
        
        {/* Company routes */}
        <Route path="/company/profile" element={
          <ProtectedRoute allowedRoles={['company'] as UserRole[]}>
            <CompanyProfilePage />
          </ProtectedRoute>
        } />
        
        {/* Lead management routes */}
        <Route path="/leads" element={
          <ProtectedRoute allowedRoles={['admin', 'master_admin', 'company', 'member'] as UserRole[]}>
            <LeadManagementPage />
          </ProtectedRoute>
        } />
        
        {/* Admin routes */}
        <Route path="/admin/leads" element={
          <ProtectedRoute allowedRoles={['admin', 'master_admin'] as UserRole[]}>
            <AdminLeadsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/settings" element={
          <ProtectedRoute allowedRoles={['admin', 'master_admin'] as UserRole[]}>
            <LeadSettingsPage />
          </ProtectedRoute>
        } />

        {/* System Modules route */}
        <Route path="/admin/system-modules" element={
          <ProtectedRoute allowedRoles={['admin', 'master_admin'] as UserRole[]}>
            <SystemModulesPage />
          </ProtectedRoute>
        } />
        
        {/* Role Management route - only accessible to master_admin */}
        <Route path="/admin/roles" element={
          <ProtectedRoute allowedRoles={['master_admin'] as UserRole[]}>
            <RoleManagementPage />
          </ProtectedRoute>
        } />
        
        {/* New MasterAdmin User Management routes */}
        <Route path="/admin/members" element={
          <ProtectedRoute allowedRoles={['master_admin'] as UserRole[]}>
            <MembersManagementPage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/companies" element={
          <ProtectedRoute allowedRoles={['master_admin'] as UserRole[]}>
            <CompaniesManagementPage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/internal-access" element={
          <ProtectedRoute allowedRoles={['master_admin'] as UserRole[]}>
            <InternalAccessPage />
          </ProtectedRoute>
        } />
        
        {/* 404 - Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
