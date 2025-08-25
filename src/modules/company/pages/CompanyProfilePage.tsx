
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { useRoleGuard } from '@/modules/auth/hooks/useRoleGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

interface CompanyProfileData {
  id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  industry?: string;
  subscription_plan?: string;
  modules_access?: string[];
  status?: string;
  created_at?: string;
}

export const CompanyProfilePage = () => {
  const { profile, refreshProfile, isLoading, user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileData | null>(null);
  const [loadingCompanyProfile, setLoadingCompanyProfile] = useState(false);
  const { loading } = useRoleGuard({
    allowedRoles: ['company', 'admin', 'master_admin'],
    redirectTo: '/unauthorized'
  });

  const fetchCompanyProfile = async () => {
    if (!profile?.company_id && profile?.role !== 'company') return;
    
    setLoadingCompanyProfile(true);
    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('id', profile.company_id || '')
        .single();
      
      if (error) throw error;
      setCompanyProfile(data);
    } catch (error) {
      console.error("Error fetching company profile:", error);
      toast({
        title: "Feil ved henting av bedriftsprofil",
        description: "Kunne ikke hente bedriftsinformasjon",
        variant: "destructive"
      });
    } finally {
      setLoadingCompanyProfile(false);
    }
  };

  useEffect(() => {
    if (profile?.company_id) {
      fetchCompanyProfile();
    }
  }, [profile]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
      await fetchCompanyProfile();
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

  if (isLoading || loading || loadingCompanyProfile) {
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
      
      {companyProfile ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{companyProfile.name}</CardTitle>
                  <CardDescription>Bedrifts-ID: {companyProfile.id}</CardDescription>
                </div>
                <Badge
                  className={companyProfile.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                >
                  {companyProfile.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Kontaktperson</h3>
                  <p className="text-base">{companyProfile.contact_name || 'Ikke angitt'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">E-post</h3>
                  <p className="text-base">{companyProfile.email || 'Ikke angitt'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Telefon</h3>
                  <p className="text-base">{companyProfile.phone || 'Ikke angitt'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Bransje</h3>
                  <p className="text-base">{companyProfile.industry || 'Ikke angitt'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Abonnement</h3>
                <Badge variant="outline" className="capitalize">
                  {companyProfile.subscription_plan || 'free'}
                </Badge>
              </div>
              
              {companyProfile.modules_access && companyProfile.modules_access.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Modultilganger</h3>
                  <div className="flex flex-wrap gap-2">
                    {companyProfile.modules_access.map((module) => (
                      <Badge key={module} variant="secondary">
                        {module}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Opprettet</h3>
                <p className="text-sm text-gray-500">
                  {companyProfile.created_at 
                    ? new Date(companyProfile.created_at).toLocaleDateString('no-NO')
                    : 'Ukjent'}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="ml-auto"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Oppdaterer...' : 'Oppdater'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : hasCompanyProfile ? (
        <div className="bg-card rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Bedriftsdetaljer</h2>
          
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Kunne ikke laste bedriftsinformasjon</h3>
            <p className="text-gray-500 mb-4">
              Bedriftsinformasjonen kunne ikke lastes. Vennligst prøv å oppdatere profilen.
            </p>
            <Button onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Oppdaterer...' : 'Oppdater profil'}
            </Button>
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
  );
};
