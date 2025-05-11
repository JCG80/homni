
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader, Building, Key, Mail } from 'lucide-react';
import { AdminNavigation } from '@/modules/admin/components/AdminNavigation';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useRoleGuard } from '@/modules/auth/hooks/useRoleGuard';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CompanyDetailView } from '../components/CompanyDetailView';
import { Badge } from '@/components/ui/badge';

interface Company {
  id: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  subscription_plan: string;
  status: string;
  leads_bought: number;
  leads_won: number;
  leads_lost: number;
  ads_bought: number;
  user_id?: string;
}

export default function CompaniesManagementPage() {
  // Role guard to ensure only master admins can access this page
  const { isAllowed, loading } = useRoleGuard({ 
    allowedRoles: ['master_admin'],
    redirectTo: '/unauthorized'
  });

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  // Fetch companies data
  const { data: companies = [], isLoading, error, refetch } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*, accounts:user_id(*)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match the Company interface
      return data.map(company => ({
        id: company.id,
        name: company.name || 'Ikke angitt',
        contact_name: company.contact_name || 'Ikke angitt',
        email: company.email || company.accounts?.email || 'Ikke angitt',
        phone: company.phone || 'Ikke angitt',
        subscription_plan: company.subscription_plan || 'free',
        status: company.status || 'inactive',
        leads_bought: 0, // These would be calculated from lead statistics
        leads_won: 0,
        leads_lost: 0,
        ads_bought: 0,
        user_id: company.user_id
      }));
    },
    enabled: isAllowed
  });
  
  const handleResetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Tilbakestilling av passord',
        description: 'E-post for tilbakestilling av passord er sendt.',
      });
    } catch (error) {
      console.error('Failed to send password reset:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke sende e-post for tilbakestilling av passord.',
        variant: 'destructive',
      });
    }
  };
  
  const handleSendLoginDetails = async (email: string) => {
    try {
      // In a real implementation, you would send login details via email
      // For now, we'll just show a toast notification
      
      toast({
        title: 'Påloggingsdetaljer sendt',
        description: `En e-post med påloggingsdetaljer er sendt til ${email}.`,
      });
    } catch (error) {
      console.error('Failed to send login details:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke sende e-post med påloggingsdetaljer.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin" />
        <span className="ml-2">Laster...</span>
      </div>
    );
  }
  
  if (!isAllowed) {
    return null; // Will be redirected by the useRoleGuard hook
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Brukeradministrasjon - Bedrifter</h1>
      <AdminNavigation />
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <Loader className="h-8 w-8 animate-spin" />
          <span className="ml-2">Laster bedrifter...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md my-6">
          <p>Feil ved lasting av bedrifter. Prøv igjen senere.</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border shadow-sm overflow-hidden mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bedriftsnavn</TableHead>
                  <TableHead>Kontaktperson / Kontaktinfo</TableHead>
                  <TableHead>Abonnement / Rolle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Annonser</TableHead>
                  <TableHead>Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow 
                    key={company.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedCompany(company)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {company.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{company.contact_name}</div>
                      <div className="text-sm text-muted-foreground">{company.email} / {company.phone}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{company.subscription_plan}</Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={company.status} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">{company.leads_bought}</span> kjøpt
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="text-green-600">{company.leads_won}</span> vunnet / 
                        <span className="text-red-600 ml-1">{company.leads_lost}</span> tapt
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{company.ads_bought} kjøpt</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetPassword(company.email)}
                          title="Tilbakestill passord"
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendLoginDetails(company.email)}
                          title="Send påloggingsdetaljer"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {companies.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Ingen bedrifter funnet.
            </div>
          )}
        </>
      )}
      
      <Dialog open={!!selectedCompany} onOpenChange={(open) => !open && setSelectedCompany(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Bedriftsdetaljer</DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <CompanyDetailView 
              company={selectedCompany} 
              onClose={() => setSelectedCompany(null)}
              onUpdate={refetch}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500">Aktiv</Badge>;
    case 'blocked':
      return <Badge className="bg-red-500">Blokkert</Badge>;
    case 'inactive':
      return <Badge variant="outline">Inaktiv</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
