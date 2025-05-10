
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { LeadsTable } from '../components/LeadsTable';
import { useRoleGuard } from '@/modules/auth/hooks/useRoleGuard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompanyLeadSettings } from '../components/CompanyLeadSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export const CompanyLeadsPage = () => {
  const { isLoading, profile, refreshProfile } = useAuth();
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
        description: "Profilen ble oppdatert.",
      });
    } catch (error) {
      toast({
        title: "Oppdatering feilet",
        description: "Kunne ikke oppdatere profilen.",
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
          <p className="text-lg">Laster inn...</p>
        </div>
      </div>
    );
  }

  // Check if company user has a company_id
  const companyId = profile?.company_id;
  const isCompanyUserWithoutCompany = profile?.role === 'company' && !companyId;
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bedrift: Tildelte leads</h1>
      </div>

      {isCompanyUserWithoutCompany && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Manglende bedriftskobling</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>Din brukerkonto er ikke koblet til en bedrift. Kontakt administrator for å få dette fikset.</p>
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
                onClick={() => window.location.href = '/company/profile'}
              >
                Gå til bedriftsprofil
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="leads" className="w-full">
        <TabsList>
          <TabsTrigger value="leads">Dine leads</TabsTrigger>
          <TabsTrigger value="settings">Innstillinger</TabsTrigger>
        </TabsList>
        <TabsContent value="leads">
          <h2 className="text-xl font-semibold mb-4">Dine leads</h2>
          <LeadsTable />
        </TabsContent>
        <TabsContent value="settings">
          <h2 className="text-xl font-semibold mb-4">Innstillinger for leads</h2>
          <CompanyLeadSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
