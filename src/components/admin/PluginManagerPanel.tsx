/**
 * Plugin Manager Panel - Admin interface for plugin management
 * Part of Homni platform development plan
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Package, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import { usePluginSystemContext } from '@/lib/core/PluginSystemProvider';
import { useFeatureFlags } from '@/lib/feature-flags/FeatureFlagProvider';
import { AuditLogger } from '@/lib/audit/AuditLogger';
import { useToast } from '@/hooks/use-toast';

export const PluginManagerPanel: React.FC = () => {
  const { 
    isInitialized,
    loadedPlugins,
    executeHooks,
    loadPlugin,
    unloadPlugin,
    togglePlugin,
    isPluginEnabled,
    error
  } = usePluginSystemContext();

  const { flags, isEnabled, hasAccess, refreshFlags } = useFeatureFlags();
  const { toast } = useToast();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Handle plugin toggle
  const handlePluginToggle = async (pluginId: string, enabled: boolean) => {
    try {
      setLoadingStates(prev => ({ ...prev, [pluginId]: true }));
      
      const success = await togglePlugin(pluginId, enabled);
      
      if (success) {
        await AuditLogger.logAction({
          action: enabled ? 'plugin_enabled' : 'plugin_disabled',
          resource_type: 'plugin',
          resource_id: pluginId,
          metadata: { enabled }
        });

        toast({
          title: "Plugin oppdatert",
          description: `Plugin ${pluginId} ble ${enabled ? 'aktivert' : 'deaktivert'}`,
        });
      } else {
        throw new Error('Failed to toggle plugin');
      }
    } catch (error) {
      toast({
        title: "Feil",
        description: `Kunne ikke ${enabled ? 'aktivere' : 'deaktivere'} plugin`,
        variant: "destructive"
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [pluginId]: false }));
    }
  };

  // Handle plugin load
  const handleLoadPlugin = async (pluginId: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, [pluginId]: true }));
      
      const success = await loadPlugin(pluginId);
      
      if (success) {
        toast({
          title: "Plugin lastet",
          description: `Plugin ${pluginId} ble lastet inn`,
        });
      } else {
        throw new Error('Failed to load plugin');
      }
    } catch (error) {
      toast({
        title: "Feil",
        description: `Kunne ikke laste plugin ${pluginId}`,
        variant: "destructive"
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [pluginId]: false }));
    }
  };

  // Handle plugin unload
  const handleUnloadPlugin = async (pluginId: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, [pluginId]: true }));
      
      const success = await unloadPlugin(pluginId);
      
      if (success) {
        await AuditLogger.logAction({
          action: 'plugin_unloaded',
          resource_type: 'plugin',
          resource_id: pluginId
        });

        toast({
          title: "Plugin fjernet",
          description: `Plugin ${pluginId} ble fjernet`,
        });
      } else {
        throw new Error('Failed to unload plugin');
      }
    } catch (error) {
      toast({
        title: "Feil",
        description: `Kunne ikke fjerne plugin ${pluginId}`,
        variant: "destructive"
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [pluginId]: false }));
    }
  };

  if (!isInitialized) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Initialiserer plugin-system...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="flex items-center justify-center p-12">
          <div className="text-center space-y-4">
            <XCircle className="h-8 w-8 text-destructive mx-auto" />
            <div>
              <p className="text-destructive font-medium">Plugin-system feil</p>
              <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Plugin Manager</h2>
          <p className="text-muted-foreground">
            Administrer system-moduler og plugins
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isInitialized ? "default" : "secondary"}>
            {isInitialized ? 'Initialisert' : 'Venter'}
          </Badge>
          <Badge variant="outline">
            {loadedPlugins.length} plugins
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="plugins" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plugins">
            <Package className="h-4 w-4 mr-2" />
            Plugins
          </TabsTrigger>
          <TabsTrigger value="features">
            <Settings className="h-4 w-4 mr-2" />
            Feature Flags
          </TabsTrigger>
          <TabsTrigger value="system">
            <Activity className="h-4 w-4 mr-2" />
            System Health
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plugins" className="space-y-4">
          <div className="grid gap-4">
            {loadedPlugins.map(plugin => (
              <Card key={plugin.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{plugin.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        ID: {plugin.id}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={plugin.enabled ? "default" : "secondary"}>
                        {plugin.enabled ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                      <Switch
                        checked={plugin.enabled}
                        onCheckedChange={(enabled) => handlePluginToggle(plugin.id, enabled)}
                        disabled={loadingStates[plugin.id]}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {plugin.enabled ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span>
                      Status: {plugin.enabled ? 'Kjører' : 'Stoppet'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {!plugin.enabled && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleLoadPlugin(plugin.id)}
                        disabled={loadingStates[plugin.id]}
                      >
                        {loadingStates[plugin.id] && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Last inn
                      </Button>
                    )}
                    
                    {plugin.enabled && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUnloadPlugin(plugin.id)}
                        disabled={loadingStates[plugin.id]}
                      >
                        {loadingStates[plugin.id] && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <Trash2 className="h-4 w-4 mr-2" />
                        Fjern
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid gap-4">
            {flags.map(flag => (
              <Card key={flag.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{flag.name}</CardTitle>
                      {flag.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {flag.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={flag.is_enabled ? "default" : "secondary"}>
                        {flag.is_enabled ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                      <Badge variant="outline">
                        {flag.rollout_percentage}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>
                      <strong>Målgruppe:</strong> {flag.target_roles.join(', ') || 'Alle'}
                    </div>
                    <div>
                      <strong>Din tilgang:</strong>{' '}
                      {hasAccess(flag.name) ? (
                        <span className="text-green-600">✓ Har tilgang</span>
                      ) : (
                        <span className="text-red-600">✗ Ingen tilgang</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Plugin System</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Operasjonell</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span>Feature Flags</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">{flags.length} flags lastet</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span>Loaded Plugins</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">{loadedPlugins.length} aktive</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};