
import { useState, useEffect } from 'react';
import { useRoleGuard } from '@/modules/auth/hooks/useRoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Building, Mail, Key, User, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { supabase } from '@/integrations/supabase/client';
import { formatDistance } from 'date-fns';
import { nb } from 'date-fns/locale';

interface Company {
  id: string;
  name: string;
  email: string;
  status: string;
  last_activity: string;
  lead_count: number;
}

export const CompanyListPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { loading: authLoading } = useRoleGuard({
    allowedRoles: ['admin', 'master-admin'],
    redirectTo: '/unauthorized'
  });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      
      // Fetch company profiles and associated user data
      const { data: companyProfiles, error } = await supabase
        .from('company_profiles')
        .select(`
          id,
          name,
          status,
          updated_at as last_activity,
          user_profiles:user_id (
            email
          ),
          (
            SELECT count(*)
            FROM leads
            WHERE company_id = company_profiles.id
          ) as lead_count
        `);
      
      if (error) throw error;
      
      // Transform the data to match our interface
      const formattedCompanies = (companyProfiles || []).map(company => ({
        id: company.id,
        name: company.name,
        email: company.user_profiles?.email || 'Ingen e-post registrert',
        status: company.status || 'inactive',
        last_activity: company.last_activity,
        lead_count: company.lead_count || 0
      }));
      
      setCompanies(formattedCompanies);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      toast({
        title: "Feil ved lasting av bedrifter",
        description: "Kunne ikke hente bedriftslisten. Vennligst prøv igjen senere.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchCompanies();
    }
  }, [authLoading]);

  const handleSendPasswordReset = async (email: string) => {
    if (!email || email === 'Ingen e-post registrert') {
      toast({
        title: "Kunne ikke sende passordgjenopprettingslenke",
        description: "Ingen e-postadresse registrert for denne bedriften.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Passordgjenopprettingslenke sendt",
        description: `En e-post med instruksjoner er sendt til ${email}`,
      });
    } catch (error) {
      console.error('Failed to send password reset:', error);
      toast({
        title: "Feil ved sending av passordgjenopprettingslenke",
        description: "Kunne ikke sende e-post. Vennligst prøv igjen senere.",
        variant: "destructive"
      });
    }
  };

  const handleSendEmail = async (email: string) => {
    if (!email || email === 'Ingen e-post registrert') {
      toast({
        title: "Kunne ikke sende e-post",
        description: "Ingen e-postadresse registrert for denne bedriften.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, you'd integrate with an email service
    toast({
      title: "E-postfunksjonalitet",
      description: "E-postsending er ikke implementert enda.",
      variant: "secondary"
    });
  };

  const handleImpersonate = async (companyId: string) => {
    // In a real app, you'd implement impersonation logic
    toast({
      title: "Brukerimitasjon",
      description: "Logg inn som-funksjonalitet er ikke implementert enda.",
      variant: "secondary"
    });
  };
  
  const filteredCompanies = companies.filter(company => 
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            <span>Bedriftsliste</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-72">
              <Input
                placeholder="Søk etter navn eller e-post..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            <Button onClick={() => fetchCompanies()}>Oppdater liste</Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bedriftsnavn</TableHead>
                  <TableHead>E-post</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Antall leads</TableHead>
                  <TableHead>Siste aktivitet</TableHead>
                  <TableHead className="text-right">Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {searchTerm ? 'Ingen bedrifter samsvarer med søket' : 'Ingen bedrifter funnet'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-500" />
                          <span>{company.name || 'Ukjent navn'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{company.email}</TableCell>
                      <TableCell>
                        <Badge variant={company.status === 'active' ? "default" : "secondary"}>
                          {company.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {company.lead_count}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {company.last_activity ? (
                          formatDistance(
                            new Date(company.last_activity),
                            new Date(),
                            { addSuffix: true, locale: nb }
                          )
                        ) : (
                          'Ukjent'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleImpersonate(company.id)}>
                              <User className="mr-2 h-4 w-4" />
                              <span>Logg inn som</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendPasswordReset(company.email)}>
                              <Key className="mr-2 h-4 w-4" />
                              <span>Tilbakestill passord</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendEmail(company.email)}>
                              <Mail className="mr-2 h-4 w-4" />
                              <span>Send e-post</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyListPage;
