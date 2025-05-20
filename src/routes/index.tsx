
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../modules/auth/pages/LoginPage';
import { RegisterPage } from '../modules/auth/pages/RegisterPage';
import NotFound from '../pages/NotFound';
import { UnauthorizedPage } from '../modules/auth/pages/UnauthorizedPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { ServiceSelectionPage } from '../modules/services/pages/ServiceSelectionPage';
import { CompanyListPage } from '../modules/user/pages/CompanyListPage';
import { PowerComparisonPage } from '../pages/PowerComparisonPage';
import { ProjectPlanPage } from '../modules/docs/pages/ProjectPlanPage';
import { FAQPage } from '../modules/docs/pages/FAQPage';
import { ProfilePage } from '../modules/auth/pages/ProfilePage';
import { MyAccountPage } from '../pages/MyAccountPage';
import { RoleDashboard } from '../components/dashboard/RoleDashboard';
import { Dashboard } from '../pages/Dashboard';
import { CompaniesManagementPage } from '../modules/admin/pages/CompaniesManagementPage';
import { MembersManagementPage } from '../modules/admin/pages/MembersManagementPage';
import { InternalAccessPage } from '../modules/admin/pages/InternalAccessPage';
import { RoleManagementPage } from '../modules/admin/pages/RoleManagementPage';
import { SystemModulesPage } from '../modules/system/pages/SystemModulesPage';
import { useAuth } from '../modules/auth/hooks';
import { LeadManagementPage } from '../modules/leads/pages/LeadManagementPage';
import { LeadKanbanPage } from '../modules/leads/pages/LeadKanbanPage';
import { LeadDetailsPage } from '../modules/leads/pages/LeadDetailsPage';
import { LeadCapturePage } from '../modules/leads/pages/LeadCapturePage';
import { LeadSettingsPage } from '../modules/leads/pages/LeadSettingsPage';
import { LeadReportsPage } from '../modules/leads/pages/LeadReportsPage';
import { LeadTestPage } from '../modules/leads/pages/LeadTestPage';
import { AdminLeadsPage } from '../modules/leads/pages/AdminLeadsPage';
import { DesignSystemPage } from '../pages/DesignSystemPage';

export const AppRouteComponents = () => {
  const { isAuthenticated, role } = useAuth();
  
  console.log("AppRouteComponents - Auth state:", { isAuthenticated, role });
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFound />} />
      
      {/* Design System Page */}
      <Route path="/design-system" element={<DesignSystemPage />} />
      
      {/* Module routes (services, features, etc.) */}
      <Route path="/select-services" element={<ServiceSelectionPage />} />
      <Route path="/companies" element={<CompanyListPage />} />
      <Route path="/power-comparison" element={<PowerComparisonPage />} />
      
      {/* Documentation routes */}
      <Route path="/docs/project-plan" element={<ProjectPlanPage />} />
      <Route path="/docs/faq" element={<FAQPage />} />
      
      {/* Lead routes */}
      <Route path="/leads" element={
        isAuthenticated ? <LeadManagementPage /> : <Navigate to="/login" />
      } />
      <Route path="/leads/kanban" element={
        isAuthenticated ? <LeadKanbanPage /> : <Navigate to="/login" />
      } />
      <Route path="/leads/:id" element={
        isAuthenticated ? <LeadDetailsPage /> : <Navigate to="/login" />
      } />
      <Route path="/lead-capture" element={<LeadCapturePage />} />
      <Route path="/lead-settings" element={
        isAuthenticated ? <LeadSettingsPage /> : <Navigate to="/login" />
      } />
      <Route path="/lead-reports" element={
        isAuthenticated ? <LeadReportsPage /> : <Navigate to="/login" />
      } />
      <Route path="/lead-test" element={
        isAuthenticated ? <LeadTestPage /> : <Navigate to="/login" />
      } />
      <Route path="/admin/leads" element={
        isAuthenticated && (role === 'admin' || role === 'master_admin') ? 
          <AdminLeadsPage /> : <Navigate to="/unauthorized" />
      } />
      
      {/* Routes that require authentication */}
      <Route path="/profile" element={
        isAuthenticated ? 
          <RoleDashboard title="Min profil">
            <ProfilePage />
          </RoleDashboard> : <Navigate to="/login" />
      } />
      
      <Route path="/account" element={
        isAuthenticated ? 
          <RoleDashboard title="Min konto">
            <MyAccountPage />
          </RoleDashboard> : <Navigate to="/login" />
      } />
      
      <Route path="/dashboard" element={
        isAuthenticated ? 
          <RoleDashboard title="Dashboard">
            <Dashboard />
          </RoleDashboard> : <Navigate to="/login" />
      } />
      
      <Route path="/dashboard/member" element={
        isAuthenticated && role === 'member' ? 
          <RoleDashboard title="Medlem Dashboard" requiredRole="member">
            <Dashboard />
          </RoleDashboard> : <Navigate to="/unauthorized" />
      } />
      
      <Route path="/dashboard/company" element={
        isAuthenticated && role === 'company' ? 
          <RoleDashboard title="Bedrift Dashboard" requiredRole="company">
            <Dashboard />
          </RoleDashboard> : <Navigate to="/unauthorized" />
      } />
      
      <Route path="/dashboard/content-editor" element={
        isAuthenticated && role === 'content_editor' ? 
          <RoleDashboard title="Content Editor" requiredRole="content_editor">
            <Dashboard />
          </RoleDashboard> : <Navigate to="/unauthorized" />
      } />
      
      {/* Admin routes */}
      <Route path="/admin/companies" element={
        isAuthenticated && (role === 'admin' || role === 'master_admin') ? 
          <RoleDashboard title="Bedrifter" requiredRole={['admin', 'master_admin']}>
            <CompaniesManagementPage />
          </RoleDashboard> : <Navigate to="/unauthorized" />
      } />
      
      <Route path="/admin/members" element={
        isAuthenticated && (role === 'admin' || role === 'master_admin') ? 
          <RoleDashboard title="Medlemmer" requiredRole={['admin', 'master_admin']}>
            <MembersManagementPage />
          </RoleDashboard> : <Navigate to="/unauthorized" />
      } />
      
      <Route path="/admin/roles" element={
        isAuthenticated && role === 'master_admin' ? 
          <RoleDashboard title="Rolleadministrasjon" requiredRole="master_admin">
            <RoleManagementPage />
          </RoleDashboard> : <Navigate to="/unauthorized" />
      } />
      
      <Route path="/admin/system-modules" element={
        isAuthenticated && (role === 'admin' || role === 'master_admin') ? 
          <RoleDashboard title="Systemmoduler" requiredRole={['admin', 'master_admin']}>
            <SystemModulesPage />
          </RoleDashboard> : <Navigate to="/unauthorized" />
      } />
      
      <Route path="/admin/internal-access" element={
        isAuthenticated && role === 'master_admin' ? 
          <RoleDashboard title="Modultilgang" requiredRole="master_admin">
            <InternalAccessPage />
          </RoleDashboard> : <Navigate to="/unauthorized" />
      } />
    </Routes>
  );
};
