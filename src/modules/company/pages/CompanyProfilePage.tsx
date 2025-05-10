
import React, { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useRoleGuard } from '@/modules/auth/hooks/useRoleGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const CompanyProfilePage = () => {
  const { profile, refreshProfile, isLoading } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const { loading } = useRoleGuard({
    allowedRoles: ['company', 'admin', 'master_admin'],
    redirectTo: '/unauthorized'
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
      toast({
        title: "Profil oppdatert",
        description: "Bedriftsprofilen ble oppdatert.",
      });
    } catch (error) {
      toast({
        title: "Oppdatering feilet",
        description: "Kunne ikke oppdatere bedriftsprofilen.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

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

  const hasCompanyProfile = profile?.role === 'company' && profile?.company_id;
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Bedriftsprofil</h1>
      
      {!hasCompanyProfile && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Manglende bedriftsprofil</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>Du er logget inn som {profile?.role || 'bruker'}, men har ikke en aktiv bedriftsprofil.</p>
            <div className="flex space-x-2 mt-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Oppdater profil
              </Button>
              <Button 
                size="sm"
                onClick={() => window.location.href = '/profile'}
              >
                Gå til min profil
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="bg-card rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Profildetaljer</h2>
        
        {hasCompanyProfile ? (
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
              <p className="text-sm font-medium text-muted-foreground">Rolle</p>
              <p>{profile.role}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Bruker-ID</p>
              <p className="text-xs text-gray-500">{profile.id}</p>
            </div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Koble til bedrift</CardTitle>
              <CardDescription>
                For å se bedriftsdetaljer må du være tilknyttet en bedrift.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Hvis du representerer en bedrift, kontakt administrator for å få tilgang.</p>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" onClick={() => window.location.href = '/register?type=business'}>
                Registrer ny bedrift
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};
