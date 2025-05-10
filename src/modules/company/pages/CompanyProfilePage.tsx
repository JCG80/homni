
import React from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useRoleGuard } from '@/modules/auth/hooks/useRoleGuard';

export const CompanyProfilePage = () => {
  const { profile, isLoading } = useAuth();
  const { loading } = useRoleGuard({
    allowedRoles: ['company', 'admin', 'master-admin'],
    redirectTo: '/unauthorized'
  });

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Laster inn bedriftsprofil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Bedriftsprofil</h1>
      
      <div className="bg-card rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Profildetaljer</h2>
        
        {profile?.company_id ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Bedrifts-ID</p>
              <p>{profile.company_id}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Navn</p>
              <p>{profile.full_name || 'Ikke angitt'}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">E-post</p>
              <p>{profile.id || 'Ikke angitt'}</p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-4">
            <p>Du er ikke tilknyttet en bedrift. Kontakt administrator for å få dette ordnet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
