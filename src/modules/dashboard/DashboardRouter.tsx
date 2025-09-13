import React from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { useRoleContext } from '@/contexts/RoleContext';
import { SimplifiedUserDashboard } from '@/components/dashboard/SimplifiedUserDashboard';
import { CompanyDashboard } from './pages/CompanyDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { MasterAdminDashboard } from './pages/MasterAdminDashboard';
import { ContentEditorDashboard } from './pages/ContentEditorDashboard';
import { useProfileContext } from '@/hooks/useProfileContext';
import { PageLayout } from '@/components/layout/PageLayout';
import { DashboardErrorBoundary } from '@/components/error/DashboardErrorBoundary';
import { logger } from '@/utils/logger';

export function DashboardRouter() {
  const { role, isAdmin, isMasterAdmin, profile } = useAuth();
  const { activeContext } = useProfileContext();
  const { activeMode, roles: contextRoles } = useRoleContext();

  logger.debug('[DashboardRouter] Current state:', {
    module: 'DashboardRouter',
    role,
    activeMode,
    activeContextType: activeContext?.type,
    hasProfile: !!profile,
    contextRoles
  });

  // Determine which dashboard to show based on active context, mode, or role
  const getDashboardComponent = () => {
    // If admin is in a switched context, show that dashboard
    if (activeContext) {
      switch (activeContext.type) {
        case 'company':
          return <CompanyDashboard />;
        case 'user':
          return <SimplifiedUserDashboard />;
        default:
          return <AdminDashboard />;
      }
    }

    // For regular users with mode switching capability
    if (contextRoles.includes('company') && activeMode === 'professional') {
      return <CompanyDashboard />;
    }

    // Otherwise show dashboard based on user's actual role
    switch (role) {
      case 'user':
        return <SimplifiedUserDashboard />;
      case 'company':
        return <CompanyDashboard />;
      case 'content_editor':
        return <ContentEditorDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'master_admin':
        return <MasterAdminDashboard />;
      default:
        return <SimplifiedUserDashboard />;
    }
  };

  // Get dashboard title based on mode and role
  const getDashboardTitle = () => {
    if (activeContext) {
      return `${activeContext.type === 'company' ? 'Bedriftsdashboard' : 'Brukerdashboard'} (Admin Mode)`;
    }
    
    // Handle mode-based titles for users with both capabilities
    if (contextRoles.includes('company')) {
      if (activeMode === 'professional') {
        return 'Bedriftsdashboard';
      } else {
        return `Dashboard - ${profile?.full_name || 'Bruker'}`;
      }
    }
    
    switch (role) {
      case 'user':
        return `Dashboard - ${profile?.full_name || 'Bruker'}`;
      case 'company':
        return 'Bedriftsdashboard';
      case 'content_editor':
        return 'Innholdsdashboard';
      case 'admin':
        return 'Admin Dashboard';
      case 'master_admin':
        return 'Master Admin Dashboard';
      default:
        return 'Dashboard';
    }
  };

  const getDashboardDescription = () => {
    if (activeContext) {
      return `Administrerer ${activeContext.type === 'company' ? 'bedrift' : 'bruker'} som administrator`;
    }

    // Handle mode-based descriptions for users with both capabilities
    if (contextRoles.includes('company')) {
      if (activeMode === 'professional') {
        return 'Administrer leads, budsjett og ytelse for din bedrift';
      } else {
        return 'Se oversikt over dine forespørsler og aktivitet på Homni';
      }
    }

    switch (role) {
      case 'user':
        return 'Se oversikt over dine forespørsler og aktivitet på Homni';
      case 'company':
        return 'Administrer leads, budsjett og ytelse for din bedrift';
      case 'content_editor':
        return 'Administrer artikler, FAQ og mediefiler';
      case 'admin':
        return 'Systemovervåking, brukerstøtte og plattformsadministrasjon';
      case 'master_admin':
        return 'Systemadministrasjon, moduler, feature flags og API-tilganger';
      default:
        return 'Velkommen til Homni';
    }
  };

  return (
    <PageLayout 
      title={getDashboardTitle()}
      description={getDashboardDescription()}
      showBreadcrumbs={true}
    >
      <DashboardErrorBoundary>
        {getDashboardComponent()}
      </DashboardErrorBoundary>
    </PageLayout>
  );
}
