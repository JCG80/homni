
import React from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { useFeatureFlags } from '../hooks/useFeatureFlag';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/modules/auth/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export const FeatureFlagsAdminPage: React.FC = () => {
  const { flags, isLoading, error } = useFeatureFlags();
  const { isMasterAdmin, isAdmin } = useAuth();
  const [updatingFlag, setUpdatingFlag] = React.useState<string | null>(null);

  const handleToggleFlag = async (flagId: string, currentState: boolean) => {
    if (!isMasterAdmin && !isAdmin) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to change feature flags",
        variant: "destructive"
      });
      return;
    }

    setUpdatingFlag(flagId);
    
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ is_enabled: !currentState })
        .eq('id', flagId);
      
      if (error) throw error;
      
      toast({
        title: "Flag updated",
        description: `Feature flag has been ${!currentState ? 'enabled' : 'disabled'}`,
      });
    } catch (err) {
      console.error('Error updating feature flag:', err);
      toast({
        title: "Update failed",
        description: "There was an error updating the feature flag",
        variant: "destructive"
      });
    } finally {
      setUpdatingFlag(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Feature Flags Administration">
        <div className="flex justify-center p-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="ml-2">Loading feature flags...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Feature Flags Administration">
        <div className="bg-destructive/10 p-4 rounded-md border border-destructive text-destructive">
          <h3 className="font-bold mb-2">Error loading feature flags</h3>
          <p>{error.message}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Feature Flags Administration">
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Feature Flags</CardTitle>
            <CardDescription>
              Enable or disable features across the platform. Changes take effect immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {flags.length === 0 ? (
              <div className="text-center p-6 bg-muted/30 rounded-md">
                <p className="text-muted-foreground">No feature flags found</p>
              </div>
            ) : (
              <div className="divide-y">
                {flags.map((flag) => (
                  <div key={flag.id} className="py-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{flag.name}</h3>
                        <Badge variant={flag.is_enabled ? "default" : "outline"}>
                          {flag.is_enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      {flag.description && (
                        <p className="text-sm text-muted-foreground mt-1">{flag.description}</p>
                      )}
                      {flag.target_roles && flag.target_roles.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {flag.target_roles.map((role) => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center">
                      {updatingFlag === flag.id ? (
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                      ) : (
                        <Switch
                          checked={flag.is_enabled}
                          onCheckedChange={() => handleToggleFlag(flag.id, flag.is_enabled)}
                          disabled={updatingFlag !== null}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
