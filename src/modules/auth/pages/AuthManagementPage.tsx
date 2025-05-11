
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { UserRole, isUserRole } from '../utils/roles';

interface UserWithProfile {
  id: string;
  email: string;
  role?: UserRole;
  full_name?: string;
  created_at: string;
}

export const AuthManagementPage = () => {
  const { isAdmin, isMasterAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load users with their profiles
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*, users:id(email, user_metadata, created_at)')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Map to our UserWithProfile format
        const formattedUsers = data.map(profile => {
          const user = profile.users as any;
          const userMetadata = user.user_metadata;
          const rawRole = userMetadata ? userMetadata.role : 'user';
          
          // Ensure role is a valid UserRole
          let role: UserRole = 'user'; // Default role
          if (isUserRole(rawRole)) {
            role = rawRole as UserRole;
          }
          
          return {
            id: profile.id,
            email: user.email,
            role,
            full_name: profile.full_name,
            created_at: user.created_at
          };
        });
        
        setUsers(formattedUsers);
      } catch (err: any) {
        console.error('Failed to load users:', err);
        setError('Could not load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, []);
  
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const { data, error } = await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: { role: newRole } }
      );
      
      if (error) throw error;
      
      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      
      toast({
        title: 'Role updated',
        description: `User role has been updated to ${newRole}.`
      });
    } catch (err: any) {
      console.error('Failed to update role:', err);
      toast({
        title: 'Error updating role',
        description: 'Could not update user role. Please try again later.',
        variant: 'destructive'
      });
    }
  };
  
  // If not admin, show unauthorized message
  if (!isAdmin && !isMasterAdmin) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Users & Roles</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                        {user.role || 'member'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                          disabled={!isMasterAdmin && user.role === 'master_admin'} // Only master_admin can change another master_admin
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="company">Company</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            {isMasterAdmin && (
                              <SelectItem value="master_admin">Master Admin</SelectItem>
                            )}
                            <SelectItem value="provider">Provider</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button variant="outline" size="sm">
                          Details
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
