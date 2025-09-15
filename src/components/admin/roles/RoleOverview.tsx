import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserSearch } from './UserSearch';
import { RoleAssignmentForm } from './RoleAssignmentForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Shield, Clock } from 'lucide-react';
import { ALL_ROLES } from '@/modules/auth/normalizeRole';
import type { UserRole } from '@/modules/auth/normalizeRole';

interface UserWithRoles {
  id: string;
  full_name: string;
  email: string;
  roles: Array<{
    role: UserRole;
    granted_at: string;
    expires_at: string | null;
    granted_by: string | null;
  }>;
}

export const RoleOverview: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users with their roles
  const { data: usersWithRoles, isLoading } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles_overview_v')
        .select(`
          user_id,
          full_name,
          email,
          role,
          granted_at,
          expires_at,
          granted_by
        `)
        .order('full_name');

      if (error) throw error;

      // Group by user_id
      const userMap = new Map<string, UserWithRoles>();
      
      data.forEach(row => {
        if (!userMap.has(row.user_id)) {
          userMap.set(row.user_id, {
            id: row.user_id,
            full_name: row.full_name || 'Unknown User',
            email: row.email || 'No email',
            roles: []
          });
        }
        
        if (row.role) {
          userMap.get(row.user_id)!.roles.push({
            role: row.role as UserRole,
            granted_at: row.granted_at,
            expires_at: row.expires_at,
            granted_by: row.granted_by
          });
        }
      });

      return Array.from(userMap.values());
    }
  });

  // Revoke role mutation
  const revokeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const { error } = await supabase.rpc('revoke_user_role', {
        _user_id: userId,
        _role: role
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast({
        title: "Rolle fjernet",
        description: "Brukerrollen har blitt fjernet",
      });
    },
    onError: (error) => {
      toast({
        title: "Feil ved fjerning av rolle",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleRoleRevoke = (userId: string, role: UserRole) => {
    if (confirm(`Er du sikker på at du vil fjerne rollen "${role}" fra denne brukeren?`)) {
      revokeRoleMutation.mutate({ userId, role });
    }
  };

  const handleUserSelect = (user: UserWithRoles) => {
    setSelectedUser(user);
    setIsAssignmentDialogOpen(true);
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'master_admin': return 'destructive';
      case 'admin': return 'secondary';
      case 'content_editor': return 'outline';
      case 'company': return 'default';
      case 'user': return 'outline';
      case 'guest': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-6">Laster brukerroller...</div>;
  }

  return (
    <div className="space-y-6">
      {/* User Search */}
      <UserSearch onUserSelect={handleUserSelect} />

      {/* Users Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bruker</TableHead>
              <TableHead>E-post</TableHead>
              <TableHead>Roller</TableHead>
              <TableHead>Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersWithRoles?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.full_name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.roles.length > 0 ? (
                      user.roles.map((roleData, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <Badge variant={getRoleBadgeVariant(roleData.role)}>
                            {roleData.role}
                          </Badge>
                          {roleData.expires_at && (
                            <Clock className="h-3 w-3 text-orange-500" />
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleRoleRevoke(user.id, roleData.role)}
                            disabled={revokeRoleMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <Badge variant="outline">Ingen roller</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUserSelect(user)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Administrer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {usersWithRoles?.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            Ingen brukere funnet. Bruk søkefunksjonen for å finne brukere.
          </div>
        )}
      </div>

      {/* Role Assignment Dialog */}
      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Administrer roller for {selectedUser?.full_name}
            </DialogTitle>
            <DialogDescription>
              Legg til eller fjern roller for denne brukeren
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <RoleAssignmentForm
              userId={selectedUser.id}
              currentRoles={selectedUser.roles.map(r => r.role)}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
                setIsAssignmentDialogOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};