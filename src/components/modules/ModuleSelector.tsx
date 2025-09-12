/**
 * PHASE 1B: Module Selection Component
 * Allows users to enable/disable optional modules
 * Part of Ultimate Master 2.0 implementation
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthState } from '@/modules/auth/hooks/useAuthState';
import { useUserModules } from '@/modules/feature_flags/hooks/useModules';
import { moduleRegistry } from '@/modules/system/ModuleRegistry';
import { toggleUserModule, getCoreModulesForRole, getOptionalModulesForRole } from '@/modules/system/ModuleInitializer';
import { toast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { logger } from '@/utils/logger';

interface ModuleSelectorProps {
  onModuleToggle?: (moduleId: string, enabled: boolean) => void;
  compact?: boolean;
}

export const ModuleSelector: React.FC<ModuleSelectorProps> = ({ 
  onModuleToggle,
  compact = false 
}) => {
  const { user, role } = useAuthState();
  const { modules: userModules, isLoading } = useUserModules();
  const [toggling, setToggling] = useState<string | null>(null);

  if (!user || !role) {
    return null;
  }

  const enabledModuleIds = userModules.map(m => m.name?.toLowerCase().replace(/\s+/g, '_') || '');
  const coreModules = getCoreModulesForRole(role);
  const optionalModules = getOptionalModulesForRole(role);
  const availableModules = moduleRegistry.getModulesForRole(role);

  const handleToggle = async (moduleId: string, enabled: boolean) => {
    if (!user) return;
    
    setToggling(moduleId);
    
    try {
      const success = await toggleUserModule(user.id, moduleId, enabled);
      
      if (success) {
        toast({
          title: enabled ? 'Module Enabled' : 'Module Disabled',
          description: `${moduleRegistry.getModule(moduleId)?.name} has been ${enabled ? 'enabled' : 'disabled'}`,
        });
        
        onModuleToggle?.(moduleId, enabled);
      } else {
        toast({
          title: 'Update Failed',
          description: 'Failed to update module settings. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      logger.error('Error toggling module:', {}, error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setToggling(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading modules...</span>
        </CardContent>
      </Card>
    );
  }

  const coreModuleData = availableModules.filter(m => coreModules.includes(m.id));
  const optionalModuleData = availableModules.filter(m => optionalModules.includes(m.id));

  return (
    <div className="space-y-6">
      {/* Core Modules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Core Modules
          </CardTitle>
          <CardDescription>
            Essential modules that are always enabled for your role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {coreModuleData.map((module) => (
            <div key={module.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{module.name}</h4>
                  <Badge variant="secondary" className="text-xs">
                    Core
                  </Badge>
                </div>
                {!compact && (
                  <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Always enabled</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Optional Modules */}
      {optionalModuleData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Optional Modules
            </CardTitle>
            <CardDescription>
              Additional modules you can enable based on your needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {optionalModuleData.map((module) => {
              const isEnabled = enabledModuleIds.includes(module.id);
              const isToggling = toggling === module.id;
              
              return (
                <div key={module.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{module.name}</h4>
                      <Badge variant={isEnabled ? "default" : "outline"} className="text-xs">
                        {module.category}
                      </Badge>
                      {module.featureFlags && (
                        <Badge variant="secondary" className="text-xs">
                          Feature Flag
                        </Badge>
                      )}
                    </div>
                    {!compact && (
                      <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                    )}
                    {module.dependencies.length > 0 && !compact && (
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground">
                          Requires: {module.dependencies.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isToggling && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => handleToggle(module.id, checked)}
                      disabled={isToggling}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Module Dependencies Warning */}
      {!compact && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Module Dependencies</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Some modules depend on others. Disabling a module may affect dependent modules.
                  Core modules cannot be disabled as they are essential for your role.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};