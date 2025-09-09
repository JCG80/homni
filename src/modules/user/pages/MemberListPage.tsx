
import { useState, useEffect } from 'react';
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

interface MemberProfile {
  id: string;
  full_name?: string;
  email?: string;
  last_login?: string;
  lead_count?: number;
  user_id?: string;
}

export const MemberListPage = () => {
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadMemberData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*');
      
      if (error) throw error;
      
      // Transform the data
      const memberData: MemberProfile[] = (data || []).map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'Ukjent bruker',
        email: profile.email || 'Ingen e-post',
        last_login: profile.updated_at || 'Ukjent',
        lead_count: 0 // This would normally come from a subquery
      }));
      
      setMembers(memberData);
    } catch (err) {
      console.error('Error loading member data:', err);
      setError('Kunne ikke laste medlemsdata. Vennligst prøv igjen senere.');
      
      toast({
        title: 'Feil ved lasting av data',
        description: 'Kunne ikke hente medlemsdata. Prøv igjen senere.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemberData();
  }, []);

  const handleImpersonateMember = (memberId: string) => {
    toast({
      title: 'Funksjon ikke tilgjengelig',
      description: 'Funksjon for å logge inn som medlem er ikke implementert ennå.',
    });
  };

  const handleSendEmail = (memberId: string) => {
    toast({
      title: 'Funksjon ikke tilgjengelig',
      description: 'E-postfunksjon er ikke implementert ennå.',
    });
  };

  const handleResetPassword = (memberId: string) => {
    toast({
      title: 'Funksjon ikke tilgjengelig',
      description: 'Funksjon for å tilbakestille passord er ikke implementert ennå.',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Laster medlemmer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Medlemsliste</h1>
        <Button onClick={loadMemberData} variant="outline">
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
          <CardTitle>Medlemmer</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p>Ingen medlemmer funnet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Navn</TableHead>
                  <TableHead>E-post</TableHead>
                  <TableHead>Siste aktivitet</TableHead>
                  <TableHead>Forespørsler</TableHead>
                  <TableHead className="text-right">Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.full_name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      {typeof member.last_login === 'string' 
                        ? new Date(member.last_login).toLocaleDateString('nb-NO') 
                        : 'Ukjent'}
                    </TableCell>
                    <TableCell>{member.lead_count || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleImpersonateMember(member.id)}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Logg inn som
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSendEmail(member.id)}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          E-post
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleResetPassword(member.id)}
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
    </div>
  );
};
