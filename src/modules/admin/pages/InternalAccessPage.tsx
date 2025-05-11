
import React, { useState } from 'react';
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
import { Loader, Settings } from 'lucide-react';
import { AdminNavigation } from '@/modules/admin/components/AdminNavigation';
import { useRoleGuard } from '@/modules/auth/hooks/useRoleGuard';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ModuleAccessManager } from '../components/ModuleAccessManager';
import { Badge } from '@/components/ui/badge';

interface InternalAdmin {
  id: string;
  full_name: string;
  email: string;
  is_internal_admin: boolean;
  module_access: string[];
}

interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
  metadata: Record<string, any>;
  accounts?: {
    email?: string;
  };
}

export default function InternalAccessPage() {
  // Role guard to ensure only master admins can access this page
  const { isAllowed, loading } = useRoleGuard({ 
    allowedRoles: ['master_admin'],
    redirectTo: '/unauthorized'
  });

  const [selectedAdmin, setSelectedAdmin] = useState<InternalAdmin | null>(null);
  
  // Fetch internal admins
  const { data: admins = [], isLoading, error, refetch } = useQuery({
    queryKey: ['internal-admins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*, accounts:auth.users!inner(*)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Filter to only include internal admins and transform data
      return (data as unknown as UserProfile[])
        .filter(profile => profile.metadata?.internal_admin === true)
        .map(profile => ({
          id: profile.id,
          full_name: profile.full_name || 'Ikke angitt',
          email: profile.email || profile.accounts?.email || 'Ikke angitt',
          is_internal_admin: true,
          module_access: profile.metadata?.module_access || []
        }));
    },
    enabled: isAllowed
  });

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
      <h1 className="text-3xl font-bold mb-6">Intern modultilgang</h1>
      <AdminNavigation />
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <Loader className="h-8 w-8 animate-spin" />
          <span className="ml-2">Laster administratorer...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md my-6">
          <p>Feil ved lasting av administratorer. Prøv igjen senere.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Interne administratorer</h2>
          </div>
          
          <div className="rounded-md border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Navn</TableHead>
                  <TableHead>E-post</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Modultilgang</TableHead>
                  <TableHead>Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.full_name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">
                        Intern admin
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {admin.is_internal_admin ? (
                        <Badge variant="outline">Full tilgang</Badge>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {admin.module_access.map(module => (
                            <Badge key={module} variant="secondary" className="text-xs">
                              {module}
                            </Badge>
                          ))}
                          {admin.module_access.length === 0 && (
                            <span className="text-sm text-muted-foreground">Ingen moduler</span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedAdmin(admin)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Administrer tilgang
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {admins.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Ingen interne administratorer funnet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
      
      <Dialog open={!!selectedAdmin} onOpenChange={(open) => !open && setSelectedAdmin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Administrer modultilgang</DialogTitle>
          </DialogHeader>
          {selectedAdmin && (
            <div className="py-4">
              <div className="mb-6">
                <p className="font-medium">{selectedAdmin.full_name}</p>
                <p className="text-sm text-muted-foreground">{selectedAdmin.email}</p>
              </div>
              
              <ModuleAccessManager 
                userId={selectedAdmin.id} 
                onUpdate={() => {
                  refetch();
                  setSelectedAdmin(null);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
