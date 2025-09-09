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
import { useRoleProtection } from '@/modules/auth/hooks';
import { supabase } from '@/lib/supabaseClient';
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

export const InternalAccessPage = () => {
  // Role protection to ensure only master admins can access this page
  const { isAllowed, loading } = useRoleProtection({ 
    allowedRoles: ['master_admin'],
    redirectTo: '/unauthorized'
  });

  const [selectedAdmin, setSelectedAdmin] = useState<InternalAdmin | null>(null);
  
  // Fetch internal admins using the new database function
  const { data: admins = [], isLoading, error, refetch } = useQuery({
    queryKey: ['internal-admins'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_internal_admins');
      
      if (error) throw error;
      
      // Transform data to match our interface
      return (data || []).map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'Ikke angitt',
        email: profile.email || 'Ikke angitt',
        is_internal_admin: true,
        module_access: [] // Will be loaded when needed
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
    return null; // Will be redirected by the useRoleProtection hook
  }

  return (
    <div className="container mx-auto p-6">
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
            <div>
              <h2 className="text-2xl font-semibold">Modultilgang</h2>
              <p className="text-muted-foreground mt-1">
                Administrer interne administratorer og deres tilgang til systemmoduler
              </p>
            </div>
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
                      <Badge variant="outline">Kan konfigureres</Badge>
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
};

export default InternalAccessPage;
