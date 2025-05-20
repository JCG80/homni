
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

export const AppRouteComponents = () => {
  const { isAuthenticated, role } = useAuth();
  
  console.log("AppRouteComponents - Auth state:", { isAuthenticated, role });
  
  return (
    <Routes>
      {/* Main routes (accessible to all) */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFound />} />
      
      {/* Module routes (services, features, etc.) */}
      <Route path="/select-services" element={<ServiceSelectionPage />} />
      <Route path="/companies" element={<CompanyListPage />} />
      <Route path="/power-comparison" element={<PowerComparisonPage />} />
      
      {/* Documentation routes */}
      <Route path="/docs/project-plan" element={<ProjectPlanPage />} />
      <Route path="/docs/faq" element={<FAQPage />} />
      
      {/* Routes that require authentication */}
      {isAuthenticated && (
        <>
          <Route path="/profile" element={
            <RoleDashboard title="Min profil">
              <ProfilePage />
            </RoleDashboard>
          } />
          
          <Route path="/account" element={
            <RoleDashboard title="Min konto">
              <MyAccountPage />
            </RoleDashboard>
          } />
          
          <Route path="/dashboard" element={
            <RoleDashboard title="Dashboard">
              <Dashboard />
            </RoleDashboard>
          } />
          
          <Route path="/dashboard/member" element={
            <RoleDashboard title="Medlem Dashboard" requiredRole="member">
              <Dashboard />
            </RoleDashboard>
          } />
          
          <Route path="/dashboard/company" element={
            <RoleDashboard title="Bedrift Dashboard" requiredRole="company">
              <Dashboard />
            </RoleDashboard>
          } />
          
          <Route path="/dashboard/content-editor" element={
            <RoleDashboard title="Content Editor" requiredRole="content_editor">
              <Dashboard />
            </RoleDashboard>
          } />
          
          {/* Admin routes */}
          <Route path="/admin/companies" element={
            <RoleDashboard title="Bedrifter" requiredRole={['admin', 'master_admin']}>
              <CompaniesManagementPage />
            </RoleDashboard>
          } />
          
          <Route path="/admin/members" element={
            <RoleDashboard title="Medlemmer" requiredRole={['admin', 'master_admin']}>
              <MembersManagementPage />
            </RoleDashboard>
          } />
          
          <Route path="/admin/roles" element={
            <RoleDashboard title="Rolleadministrasjon" requiredRole="master_admin">
              <RoleManagementPage />
            </RoleDashboard>
          } />
          
          <Route path="/admin/system-modules" element={
            <RoleDashboard title="Systemmoduler" requiredRole={['admin', 'master_admin']}>
              <SystemModulesPage />
            </RoleDashboard>
          } />
          
          <Route path="/admin/internal-access" element={
            <RoleDashboard title="Modultilgang" requiredRole="master_admin">
              <InternalAccessPage />
            </RoleDashboard>
          } />
        </>
      )}
    </Routes>
  );
};
