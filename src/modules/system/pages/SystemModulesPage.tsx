
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { getSystemModules, toggleSystemModule } from '../api/systemModules';
import type { SystemModule } from '../types/systemTypes';
import { toast } from '@/components/ui/use-toast';
import { AdminNavigation } from '@/modules/admin/components/AdminNavigation';
import { useRoleProtection } from '@/modules/auth/hooks';
import { Settings } from 'lucide-react';

export const SystemModulesPage = () => {
  // Protect the page - only master_admin can access
  const { isAllowed, loading: roleLoading } = useRoleProtection({ 
    allowedRoles: ['master_admin'],
    redirectTo: '/unauthorized'
  });
  
  const [modules, setModules] = useState<SystemModule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Return early if no access - useRoleProtection handles redirect
  if (!isAllowed && !roleLoading) {
    return null;
  }

  useEffect(() => {
    async function loadModules() {
      // Only load if user has access
      if (!isAllowed) return;
      
      try {
        setLoading(true);
        const modulesData = await getSystemModules();
        setModules(modulesData);
      } catch (error) {
        console.error('Failed to load system modules:', error);
        setError('Kunne ikke laste systemmoduler. Vennligst prøv igjen senere.');
      } finally {
        setLoading(false);
      }
    }

    loadModules();
  }, [isAllowed]);

  const handleToggleModule = async (moduleId: string, currentActive: boolean) => {
    try {
      const success = await toggleSystemModule(moduleId, !currentActive);
      
      if (success) {
        // Update local state
        setModules(prev => 
          prev.map(mod => 
            mod.id === moduleId ? { ...mod, is_active: !currentActive } : mod
          )
        );
        
        toast({
          title: `Modul ${!currentActive ? 'aktivert' : 'deaktivert'}`,
          description: `Modulstatus er oppdatert.`,
        });
      } else {
        throw new Error('Kunne ikke oppdatere modulstatus');
      }
    } catch (error) {
      console.error('Error toggling module:', error);
      toast({
        title: 'Feil ved oppdatering',
        description: 'Kunne ikke endre modulstatus. Prøv igjen senere.',
        variant: 'destructive',
      });
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">System Moduler</h1>
            <p className="text-muted-foreground">
              Administrer systemmoduler og funksjonalitet
            </p>
          </div>
        </div>

        <AdminNavigation />

        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg">Laster moduler...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">System Moduler</h1>
          <p className="text-muted-foreground">
            Administrer systemmoduler og funksjonalitet
          </p>
        </div>
      </div>

      <AdminNavigation />

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-md mb-6">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Modul administrasjon</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Navn</TableHead>
                <TableHead>Beskrivelse</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktivering</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((module) => (
                <TableRow key={module.id}>
                  <TableCell className="font-medium">{module.name}</TableCell>
                  <TableCell>{module.description}</TableCell>
                  <TableCell>
                    <Badge variant={module.is_active ? "default" : "outline"}>
                      {module.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={module.is_active}
                      onCheckedChange={() => handleToggleModule(module.id, module.is_active)}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {modules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Ingen moduler funnet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

