
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
import { SystemModule } from '../types/systemModules';
import { toast } from '@/hooks/use-toast';

export const SystemModulesPage = () => {
  const [modules, setModules] = useState<SystemModule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadModules() {
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
  }, []);

  const handleToggleModule = async (moduleId: string, currentActive: boolean) => {
    try {
      const success = await toggleSystemModule(moduleId, !currentActive);
      
      if (success) {
        // Update local state
        setModules(prev => 
          prev.map(mod => 
            mod.id === moduleId ? { ...mod, active: !currentActive } : mod
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Laster moduler...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Systemmoduler</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-6">
          <p className="text-red-700">{error}</p>
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
                    <Badge variant={module.active ? "default" : "outline"}>
                      {module.active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={module.active}
                      onCheckedChange={() => handleToggleModule(module.id, module.active)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
