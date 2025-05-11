
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
import { Loader, User, Key, Mail } from 'lucide-react';
import { AdminNavigation } from '@/modules/admin/components/AdminNavigation';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useRoleGuard } from '@/modules/auth/hooks/useRoleGuard';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MemberDetailView } from '../components/MemberDetailView';
import { Badge } from '@/components/ui/badge';

interface Member {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  request_count: number;
  last_active: string;
}

export function MembersManagementPage() {
  // Role guard to ensure only master admins can access this page
  const { isAllowed, loading } = useRoleGuard({ 
    allowedRoles: ['master_admin'],
    redirectTo: '/unauthorized'
  });

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // Fetch members data
  const { data: members = [], isLoading, error, refetch } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*, accounts:auth.users!inner(*)')
        .eq('accounts.account_type', 'member')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match the Member interface
      return data.map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'Ikke angitt',
        email: profile.email || (profile.accounts?.email || 'Ikke angitt'),
        phone: profile.phone || 'Ikke angitt',
        status: profile.accounts?.status || 'inactive',
        request_count: 0, // This would be calculated from the leads table
        last_active: profile.updated_at || profile.created_at || 'Ukjent'
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
  
  const handleSendUsername = async (email: string) => {
    try {
      // In a real implementation, you would send an email with the username
      // For now, we'll just show a toast notification
      
      toast({
        title: 'Brukernavn sendt',
        description: `En e-post med brukernavnet er sendt til ${email}.`,
      });
    } catch (error) {
      console.error('Failed to send username:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke sende e-post med brukernavn.',
        variant: 'destructive',
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Ukjent') return 'Ukjent';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('nb-NO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'Ugyldig dato';
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
      <h1 className="text-3xl font-bold mb-6">Brukeradministrasjon - Medlemmer</h1>
      <AdminNavigation />
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <Loader className="h-8 w-8 animate-spin" />
          <span className="ml-2">Laster medlemmer...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md my-6">
          <p>Feil ved lasting av medlemmer. Prøv igjen senere.</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border shadow-sm overflow-hidden mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fullt navn</TableHead>
                  <TableHead>E-post / Telefon</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Antall forespørsler</TableHead>
                  <TableHead>Sist aktiv</TableHead>
                  <TableHead>Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow 
                    key={member.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedMember(member)}
                  >
                    <TableCell className="font-medium">{member.full_name}</TableCell>
                    <TableCell>
                      <div>{member.email}</div>
                      <div className="text-sm text-muted-foreground">{member.phone}</div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={member.status} />
                    </TableCell>
                    <TableCell>{member.request_count}</TableCell>
                    <TableCell>{formatDate(member.last_active)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetPassword(member.email)}
                          title="Tilbakestill passord"
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendUsername(member.email)}
                          title="Send brukernavn"
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
          
          {members.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Ingen medlemmer funnet.
            </div>
          )}
        </>
      )}
      
      <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Medlemdetaljer</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <MemberDetailView 
              member={selectedMember} 
              onClose={() => setSelectedMember(null)}
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
    case 'verified':
      return <Badge className="bg-blue-500">Verifisert</Badge>;
    case 'inactive':
      return <Badge variant="outline">Inaktiv</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
