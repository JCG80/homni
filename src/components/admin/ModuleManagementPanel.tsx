/**
 * PHASE 2: Module Management Panel
 * Admin interface for managing system modules
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle, XCircle, Info, Settings } from 'lucide-react';
import { useModuleManagement } from '@/hooks/useModuleNavigation';
import { moduleRegistry, type ModuleMetadata } from '@/modules/system/ModuleRegistry';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface ModuleManagementPanelProps {
  className?: string;
}

export const ModuleManagementPanel: React.FC<ModuleManagementPanelProps> = ({
  className
}) => {
  const { modules, canManageModules, toggleModule } = useModuleManagement();
  const [allModules, setAllModules] = useState<ModuleMetadata[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load all registered modules
    setAllModules(moduleRegistry.getAllModules());
  }, []);

  const handleToggleModule = async (moduleId: string, isActive: boolean) => {
    if (!canManageModules) {
      toast({
        title: 'Adgang nektet',
        description: 'Du har ikke tilgang til å administrere moduler',
        variant: 'destructive'
      });
      return;
    }

    setLoading(prev => ({ ...prev, [moduleId]: true }));

    try {
      // Check dependencies before deactivating
      if (!isActive) {
        const validation = moduleRegistry.validateDependencies(moduleId);
        if (!validation.valid) {
          toast({
            title: 'Kan ikke deaktivere modul',
            description: `Modulen kreves av andre aktive moduler`,
            variant: 'destructive'
          });
          return;
        }
      }

      const success = await toggleModule(moduleId, isActive);
      
      if (success) {
        // Update local state
        setAllModules(prev => prev.map(module => 
          module.id === moduleId 
            ? { ...module, isActive }
            : module
        ));

        toast({
          title: 'Modul oppdatert',
          description: `${moduleRegistry.getModule(moduleId)?.name} er nå ${isActive ? 'aktivert' : 'deaktivert'}`,
          variant: 'default'
        });
      } else {
        toast({
          title: 'Feil',
          description: 'Kunne ikke oppdatere modul',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Feil',
        description: 'En uventet feil oppstod',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, [moduleId]: false }));
    }
  };

  const getCategoryIcon = (category: ModuleMetadata['category']) => {
    switch (category) {
      case 'core': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'business': return <Settings className="w-4 h-4 text-blue-500" />;
      case 'analytics': return <Info className="w-4 h-4 text-purple-500" />;
      case 'admin': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'content': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: ModuleMetadata['category']) => {
    switch (category) {
      case 'core': return 'bg-green-50 text-green-700 border-green-200';
      case 'business': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'analytics': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'admin': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'content': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const groupedModules = allModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, ModuleMetadata[]>);

  if (!canManageModules) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Moduladministrasjon</CardTitle>
          <CardDescription>
            Du har ikke tilgang til å administrere systemmoduler
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle>Moduladministrasjon</CardTitle>
          <CardDescription>
            Administrer systemmoduler og deres avhengigheter. Vær forsiktig når du deaktiverer moduler.
          </CardDescription>
        </CardHeader>
      </Card>

      {Object.entries(groupedModules).map(([category, categoryModules]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getCategoryIcon(category as ModuleMetadata['category'])}
              {category.charAt(0).toUpperCase() + category.slice(1)}-moduler
            </CardTitle>
            <CardDescription>
              {categoryModules.length} moduler i denne kategorien
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryModules.map((module, index) => {
              const validation = moduleRegistry.validateDependencies(module.id);
              const hasBlockingDependents = !validation.valid && module.isActive;

              return (
                <div key={module.id}>
                  <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{module.name}</h3>
                        <Badge 
                          className={getCategoryColor(module.category)}
                          variant="outline"
                        >
                          v{module.version}
                        </Badge>
                        {module.isActive ? (
                          <Badge variant="default">Aktiv</Badge>
                        ) : (
                          <Badge variant="secondary">Inaktiv</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {module.description}
                      </p>
                      
                      {module.dependencies.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Avhengigheter:</span>
                          {module.dependencies.map(dep => (
                            <Badge key={dep} variant="outline" className="text-xs">
                              {dep}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {module.featureFlags && module.featureFlags.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>Feature flags:</span>
                          {module.featureFlags.map(flag => (
                            <Badge key={flag} variant="outline" className="text-xs">
                              {flag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {hasBlockingDependents && (
                        <div className="flex items-center gap-2 text-xs text-orange-600 mt-2">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Kan ikke deaktiveres - kreves av andre moduler</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={module.isActive}
                        onCheckedChange={(checked) => handleToggleModule(module.id, checked)}
                        disabled={
                          loading[module.id] || 
                          (hasBlockingDependents && !module.isActive) ||
                          module.category === 'core' // Core modules cannot be disabled
                        }
                      />
                      {loading[module.id] && (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  </div>

                  {index < categoryModules.length - 1 && <Separator className="my-4" />}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};