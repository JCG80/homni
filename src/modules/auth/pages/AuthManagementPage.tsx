
import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw } from 'lucide-react';
import { ALL_ROLES, UserRole } from '../utils/roles';
import { updateUserRole } from '../api/auth-api';

interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
  role: UserRole;
}

export const AuthManagementPage = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*');
      
      if (error) throw error;
      
      // Transform the data
      const userData = (data || []).map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'Ukjent bruker',
        email: profile.email || 'Ingen e-post',
        role: profile.metadata?.role || 'user' as UserRole
      }));
      
      setUsers(userData);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Kunne ikke laste brukerdata. Vennligst prøv igjen senere.');
      
      toast({
        title: 'Feil ved lasting av data',
        description: 'Kunne ikke hente brukerdata. Prøv igjen senere.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      // Update user role in database
      await updateUserRole(userId, newRole);
      
      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      
      toast({
        title: 'Rolle oppdatert',
        description: 'Brukerens rolle er oppdatert.',
      });
      
    } catch (err) {
      console.error('Error updating user role:', err);
      
      toast({
        title: 'Feil ved oppdatering',
        description: 'Kunne ikke oppdatere brukerens rolle. Prøv igjen senere.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Laster brukerdata...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Brukeradministrasjon</h1>
        <Button onClick={loadUserData} variant="outline">
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
          <CardTitle>Brukere og roller</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p>Ingen brukere funnet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Navn</TableHead>
                  <TableHead>E-post</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead className="text-right">Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Velg rolle" />
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRoleChange(user.id, user.role)}
                      >
                        Oppdater
                      </Button>
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
