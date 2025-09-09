
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, RefreshCw, UserCheck } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';

interface CompanyProfile {
  id: string;
  name: string;
  email?: string;
  status?: string;
  last_activity?: string;
  lead_count?: number;
}

export const CompanyListPage = () => {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      
      // Use a simpler query to avoid the complex join issues
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*');
      
      if (error) throw error;
      
      // Transform the data manually
      const companyData: CompanyProfile[] = (data || []).map(company => ({
        id: company.id,
        name: company.name || 'Ukjent bedrift',
        status: company.status || 'active',
        // We'll add placeholder values for the missing fields that would come from joins
        last_activity: company.updated_at || 'Ukjent',
        lead_count: 0 // This would normally come from a subquery
      }));
      
      setCompanies(companyData);
    } catch (err) {
      console.error('Error loading company data:', err);
      setError('Kunne ikke laste bedriftsdata. Vennligst prøv igjen senere.');
      
      toast({
        title: 'Feil ved lasting av data',
        description: 'Kunne ikke hente bedriftsdata. Prøv igjen senere.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyData();
  }, []);

  const handleImpersonateCompany = (companyId: string) => {
    toast({
      title: 'Funksjon ikke tilgjengelig',
      description: 'Funksjon for å logge inn som bedrift er ikke implementert ennå.',
    });
  };

  const handleSendEmail = (companyId: string) => {
    toast({
      title: 'Funksjon ikke tilgjengelig',
      description: 'E-postfunksjon er ikke implementert ennå.',
    });
  };

  const handleResetPassword = (companyId: string) => {
    toast({
      title: 'Funksjon ikke tilgjengelig',
      description: 'Funksjon for å tilbakestille passord er ikke implementert ennå.',
    });
  };

  if (loading) {
    return (
      <PageLayout title="Bedriftsliste" description="Oversikt over alle registrerte bedrifter">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg">Laster bedrifter...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Bedriftsliste" description="Oversikt over alle registrerte bedrifter">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={loadCompanyData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Oppdater
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Bedrifter</CardTitle>
        </CardHeader>
        <CardContent>
          {companies.length === 0 ? (
            <p>Ingen bedrifter funnet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Navn</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Siste aktivitet</TableHead>
                  <TableHead>Forespørsler</TableHead>
                  <TableHead className="text-right">Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">
                      <Button 
                        variant="link" 
                        onClick={() => navigate(`/insurance/companies/${company.id}`)}
                      >
                        {company.name}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {company.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {typeof company.last_activity === 'string' 
                        ? new Date(company.last_activity).toLocaleDateString('nb-NO') 
                        : 'Ukjent'}
                    </TableCell>
                    <TableCell>{company.lead_count || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleImpersonateCompany(company.id)}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Logg inn som
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSendEmail(company.id)}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          E-post
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleResetPassword(company.id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Reset passord
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
};
