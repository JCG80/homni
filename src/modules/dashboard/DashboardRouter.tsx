import React from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { SimplifiedUserDashboard } from '@/components/dashboard/SimplifiedUserDashboard';
import { CompanyDashboard } from './pages/CompanyDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { MasterAdminDashboard } from './pages/MasterAdminDashboard';
import { ContentEditorDashboard } from './pages/ContentEditorDashboard';
import { useProfileContext } from '@/hooks/useProfileContext';
import { PageLayout } from '@/components/layout/PageLayout';

export function DashboardRouter() {
  const { role, isAdmin, isMasterAdmin, profile } = useAuth();
  const { activeContext } = useProfileContext();

  // Determine which dashboard to show based on active context or role
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

  // Get dashboard title based on role
  const getDashboardTitle = () => {
    if (activeContext) {
      return `${activeContext.type === 'company' ? 'Bedriftsdashboard' : 'Brukerdashboard'} (Admin Mode)`;
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
      {getDashboardComponent()}
    </PageLayout>
  );
}
