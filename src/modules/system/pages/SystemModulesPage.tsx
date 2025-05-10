
import { useState, useEffect } from 'react';
import { useRoleGuard } from '@/modules/auth/hooks/useRoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { List, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SystemModule } from '../types/systemModules';
import { getSystemModules, toggleSystemModule } from '../api/systemModules';

export const SystemModulesPage = () => {
  const [modules, setModules] = useState<SystemModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingModules, setUpdatingModules] = useState<string[]>([]);
  const { toast } = useToast();
  const { loading: authLoading } = useRoleGuard({
    allowedRoles: ['admin', 'master-admin'],
    redirectTo: '/unauthorized'
  });
  
  const fetchModules = async () => {
    try {
      setLoading(true);
      const modules = await getSystemModules();
      setModules(modules);
    } catch (error) {
      console.error('Failed to fetch system modules:', error);
      toast({
        title: "Feil ved lasting av moduler",
        description: "Kunne ikke hente systemmoduler. Vennligst prøv igjen senere.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!authLoading) {
      fetchModules();
    }
  }, [authLoading]);
  
  const handleToggleModule = async (moduleId: string, newActiveState: boolean) => {
    setUpdatingModules(prev => [...prev, moduleId]);
    
    try {
      const success = await toggleSystemModule(moduleId, newActiveState);
      
      if (success) {
        // Update local state
        setModules(prev => 
          prev.map(module => 
            module.id === moduleId ? { ...module, active: newActiveState } : module
          )
        );
        
        toast({
          title: `Modul ${newActiveState ? 'aktivert' : 'deaktivert'}`,
          description: `Modul ${moduleId} er nå ${newActiveState ? 'aktivert' : 'deaktivert'}.`,
          variant: newActiveState ? "default" : "secondary"
        });
      } else {
        throw new Error('Could not toggle module');
      }
    } catch (error) {
      console.error(`Failed to toggle module ${moduleId}:`, error);
      toast({
        title: "Feil ved oppdatering av modul",
        description: `Kunne ikke ${newActiveState ? 'aktivere' : 'deaktivere'} modul. Vennligst prøv igjen senere.`,
        variant: "destructive"
      });
    } finally {
      setUpdatingModules(prev => prev.filter(id => id !== moduleId));
    }
  };
  
  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-6 w-6" />
              <span>Systemmoduler</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-6 w-6" />
            <span>Systemmoduler</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modul</TableHead>
                <TableHead>Beskrivelse</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Handling</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((module) => {
                const isUpdating = updatingModules.includes(module.id);
                
                return (
                  <TableRow key={module.id}>
                    <TableCell className="font-medium">{module.name}</TableCell>
                    <TableCell>{module.description}</TableCell>
                    <TableCell>
                      {module.active ? (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Aktiv
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Inaktiv
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Switch 
                          checked={module.active}
                          disabled={isUpdating || module.id === 'system'} // Can't disable the system module itself
                          onCheckedChange={(checked) => handleToggleModule(module.id, checked)}
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          disabled={isUpdating || module.id === 'system'}
                          onClick={() => handleToggleModule(module.id, !module.active)}
                        >
                          {module.active ? 'Deaktiver' : 'Aktiver'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemModulesPage;
