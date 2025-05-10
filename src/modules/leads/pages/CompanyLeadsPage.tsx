
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { LeadsTable } from '../components/LeadsTable';
import { useRoleGuard } from '@/modules/auth/hooks/useRoleGuard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { CompanyLeadSettings } from '../components/CompanyLeadSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const CompanyLeadsPage = () => {
  const { isLoading, profile } = useAuth();
  const { loading } = useRoleGuard({
    allowedRoles: ['company', 'admin', 'master-admin'],
    redirectTo: '/unauthorized'
  });

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
  const isCompanyUserWithoutCompany = profile?.role === 'company' && !profile?.company_id;
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bedrift: Tildelte leads</h1>
      </div>

      {isCompanyUserWithoutCompany && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Manglende bedriftskobling</AlertTitle>
          <AlertDescription>
            Din brukerkonto er ikke koblet til en bedrift. Kontakt administrator for å få dette fikset.
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
