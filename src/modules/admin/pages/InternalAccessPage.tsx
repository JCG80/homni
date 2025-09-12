import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRoleProtection } from '@/modules/auth/hooks';
import { Loader, AlertCircle, UserPlus, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/utils/logger';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { ModuleAccessManager } from '../components/ModuleAccessManager';

interface InternalAdmin {
  id: string;
  full_name: string | null;
  email: string | null;
  metadata: any;
  created_at: string;
}

export function InternalAccessPage() {
  const { isAllowed, loading } = useRoleProtection({ 
    allowedRoles: ['master_admin'],
    redirectTo: '/unauthorized'
  });
  
  const [selectedAdmin, setSelectedAdmin] = useState<InternalAdmin | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const { toast } = useToast();

  const { data: internalAdmins, isLoading, error, refetch } = useQuery({
    queryKey: ['internal-admins'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_internal_admins');
      
      if (error) {
        logger.error('Error fetching internal admins', { error });
        throw new Error('Failed to fetch internal administrators');
      }
      
      return data as InternalAdmin[];
    },
    enabled: isAllowed
  });

  const grantAdminMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase.rpc('set_internal_admin_status', {
        user_email: email,
        is_admin: true
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (message) => {
      toast({
        title: "Suksess",
        description: message,
      });
      setNewAdminEmail('');
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Feil",
        description: error.message || "Kunne ikke gi intern admin-tilgang",
        variant: "destructive",
      });
    }
  });

  const revokeAdminMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase.rpc('set_internal_admin_status', {
        user_email: email,
        is_admin: false
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (message) => {
      toast({
        title: "Suksess",
        description: message,
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Feil",
        description: error.message || "Kunne ikke fjerne intern admin-tilgang",
        variant: "destructive",
      });
    }
  });

  const handleAccessUpdate = () => {
    // Refetch the list after updating access
    refetch();
    setSelectedAdmin(null);
  };

  const handleGrantAdmin = () => {
    if (newAdminEmail.trim()) {
      grantAdminMutation.mutate(newAdminEmail.trim());
    }
  };

  const handleRevokeAdmin = (email: string) => {
    if (email) {
      revokeAdminMutation.mutate(email);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader className="h-6 w-6 animate-spin mr-2" />
        Laster...
      </div>
    );
  }

  if (!isAllowed) {
    return null; // Will be redirected by the useRoleProtection hook
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader className="h-6 w-6 animate-spin mr-2" />
        Laster interne administratorer...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <AlertCircle className="mx-auto h-12 w-12 mb-4" />
        <p>Feil ved lasting av interne administratorer</p>
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          className="mt-4"
        >
          Prøv igjen
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Intern tilgangsstyring</h1>
        <p className="text-muted-foreground">
          Administrer interne administratorrettigheter og modultilganger
        </p>
      </div>

      {/* Grant Admin Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Gi intern admin-tilgang
          </CardTitle>
          <CardDescription>
            Skriv inn e-postadressen til brukeren som skal få intern admin-tilgang
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="email">E-postadresse</Label>
              <Input
                id="email"
                type="email"
                placeholder="bruker@eksempel.no"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleGrantAdmin();
                  }
                }}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleGrantAdmin}
                disabled={!newAdminEmail.trim() || grantAdminMutation.isPending}
              >
                {grantAdminMutation.isPending ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Tildeler...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Gi tilgang
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {internalAdmins && internalAdmins.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Navn</TableHead>
                <TableHead>E-post</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Handlinger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {internalAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">
                    {admin.full_name || 'Ingen navn'}
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Intern admin
                    </span>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedAdmin(admin)}
                        >
                          Administrer tilgang
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Modultilgang - {admin.full_name}</DialogTitle>
                          <DialogDescription>
                            Konfigurer modultilgang og admin-privilegier for denne brukeren
                          </DialogDescription>
                        </DialogHeader>
                        {selectedAdmin && (
                          <ModuleAccessManager 
                            userId={selectedAdmin.id} 
                            onUpdate={handleAccessUpdate} 
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="destructive"
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          Fjern admin
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Fjern intern admin-tilgang?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Dette vil fjerne alle interne administratorrettigheter fra {admin.full_name || admin.email}. 
                            Handlingen kan ikke angres.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Avbryt</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRevokeAdmin(admin.email || '')}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Fjern tilgang
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-muted-foreground">Ingen interne administratorer funnet</p>
        </div>
      )}
    </div>
  );
}

export default InternalAccessPage;
