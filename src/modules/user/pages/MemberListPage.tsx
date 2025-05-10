
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
import { MoreHorizontal, Users, Mail, Key, User, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { supabase } from '@/integrations/supabase/client';
import { formatDistance } from 'date-fns';
import { nb } from 'date-fns/locale';

interface Member {
  id: string;
  full_name: string;
  email: string;
  role: string;
  last_activity: string;
  lead_count: number;
}

export const MemberListPage = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { loading: authLoading } = useRoleGuard({
    allowedRoles: ['admin', 'master-admin'],
    redirectTo: '/unauthorized'
  });

  const fetchMembers = async () => {
    try {
      setLoading(true);
      
      // Fetch users with role 'user' (members)
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          full_name,
          email,
          metadata->role as role,
          updated_at as last_activity,
          (
            SELECT count(*)
            FROM leads
            WHERE submitted_by = user_profiles.id
          ) as lead_count
        `)
        .eq('metadata->role', 'user');
      
      if (error) throw error;
      
      setMembers(data || []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      toast({
        title: "Feil ved lasting av medlemmer",
        description: "Kunne ikke hente medlemslisten. Vennligst prøv igjen senere.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchMembers();
    }
  }, [authLoading]);

  const handleSendPasswordReset = async (email: string) => {
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
    // In a real app, you'd integrate with an email service
    toast({
      title: "E-postfunksjonalitet",
      description: "E-postsending er ikke implementert enda.",
      variant: "secondary"
    });
  };

  const handleImpersonate = async (userId: string) => {
    // In a real app, you'd implement impersonation logic
    toast({
      title: "Brukerimitasjon",
      description: "Logg inn som-funksjonalitet er ikke implementert enda.",
      variant: "secondary"
    });
  };
  
  const filteredMembers = members.filter(member => 
    member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            <span>Medlemsliste</span>
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
              <Eye className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            <Button onClick={() => fetchMembers()}>Oppdater liste</Button>
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
                  <TableHead>Navn</TableHead>
                  <TableHead>E-post</TableHead>
                  <TableHead>Antall forespørsler</TableHead>
                  <TableHead>Siste aktivitet</TableHead>
                  <TableHead className="text-right">Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      {searchTerm ? 'Ingen medlemmer samsvarer med søket' : 'Ingen medlemmer funnet'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{member.full_name || 'Ukjent navn'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge variant={member.lead_count > 0 ? "default" : "secondary"}>
                          {member.lead_count}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {member.last_activity ? (
                          formatDistance(
                            new Date(member.last_activity),
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
                            <DropdownMenuItem onClick={() => handleImpersonate(member.id)}>
                              <User className="mr-2 h-4 w-4" />
                              <span>Logg inn som</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendPasswordReset(member.email)}>
                              <Key className="mr-2 h-4 w-4" />
                              <span>Tilbakestill passord</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendEmail(member.email)}>
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

export default MemberListPage;
