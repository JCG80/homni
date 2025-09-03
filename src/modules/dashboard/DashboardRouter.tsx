import React from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { UserDashboard } from './UserDashboard';
import { CompanyDashboard } from './CompanyDashboard';
import { AdminDashboard } from './AdminDashboard';
import { useProfileContext } from '@/hooks/useProfileContext';

interface ContentEditorDashboardProps {}

function ContentEditorDashboard({}: ContentEditorDashboardProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Innholdsdashboard
        </h1>
        <p className="text-muted-foreground">
          Administrer artikler, FAQ og mediefiler.
        </p>
      </div>
      
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Innholdsstyringsverktøy kommer snart...
        </p>
      </div>
    </div>
  );
}

function MasterAdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Master Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Systemadministrasjon, moduler, feature flags og API-tilganger.
        </p>
      </div>
      
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Master admin-funksjoner kommer snart...
        </p>
      </div>
    </div>
  );
}

export function DashboardRouter() {
  const { role, isAdmin, isMasterAdmin } = useAuth();
  const { activeContext } = useProfileContext();

  // Determine which dashboard to show based on active context or role
  const getDashboardComponent = () => {
    // If admin is in a switched context, show that dashboard
    if (activeContext) {
      switch (activeContext.type) {
        case 'company':
          return <CompanyDashboard />;
        case 'user':
          return <UserDashboard />;
        default:
          return <AdminDashboard />;
      }
    }

    // Otherwise show dashboard based on user's actual role
    switch (role) {
      case 'user':
        return <UserDashboard />;
      case 'company':
        return <CompanyDashboard />;
      case 'content_editor':
        return <ContentEditorDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'master_admin':
        return <MasterAdminDashboard />;
      default:
        return <UserDashboard />;
    }
  };

  return (
    <div className="container mx-auto py-6">
      {getDashboardComponent()}
    </div>
  );
}
