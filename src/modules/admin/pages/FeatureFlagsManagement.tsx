import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { useFeatureFlags } from '@/modules/feature_flags/hooks/useFeatureFlag';
import { useAuth } from '@/modules/auth/hooks';
import { 
  Plus, 
  Settings, 
  Trash2, 
  Edit, 
  Users, 
  Percent,
  Calendar,
  Loader2,
  Flag,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface CreateFlagData {
  name: string;
  description: string;
  rollout_percentage: number;
  target_roles: string[];
}

export const FeatureFlagsManagement: React.FC = () => {
  const { flags, isLoading, error } = useFeatureFlags();
  const { isMasterAdmin, isAdmin } = useAuth();
  const [updatingFlag, setUpdatingFlag] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newFlag, setNewFlag] = useState<CreateFlagData>({
    name: '',
    description: '',
    rollout_percentage: 100,
    target_roles: []
  });

  const availableRoles = ['guest', 'user', 'company', 'content_editor', 'admin', 'master_admin'];

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
      
      // Emit event for analytics
      window.dispatchEvent(new CustomEvent('feature.flag.toggled', {
        detail: { flagId, enabled: !currentState }
      }));
      
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

  const handleCreateFlag = async () => {
    if (!newFlag.name.trim()) {
      toast({
        title: "Invalid input",
        description: "Flag name is required",
        variant: "destructive"
      });
      return;
    }

    setCreateLoading(true);
    
    try {
      const { error } = await supabase
        .from('feature_flags')
        .insert({
          name: newFlag.name.trim(),
          description: newFlag.description.trim() || null,
          is_enabled: false,
          rollout_percentage: newFlag.rollout_percentage,
          target_roles: newFlag.target_roles.length > 0 ? newFlag.target_roles : null
        });
      
      if (error) throw error;
      
      toast({
        title: "Flag created",
        description: `Feature flag "${newFlag.name}" has been created`,
      });
      
      setShowCreateDialog(false);
      setNewFlag({
        name: '',
        description: '',
        rollout_percentage: 100,
        target_roles: []
      });
    } catch (err) {
      console.error('Error creating feature flag:', err);
      toast({
        title: "Creation failed",
        description: "There was an error creating the feature flag",
        variant: "destructive"
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteFlag = async (flagId: string, flagName: string) => {
    if (!confirm(`Are you sure you want to delete the feature flag "${flagName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('feature_flags')
        .delete()
        .eq('id', flagId);
      
      if (error) throw error;
      
      toast({
        title: "Flag deleted",
        description: `Feature flag "${flagName}" has been deleted`,
      });
    } catch (err) {
      console.error('Error deleting feature flag:', err);
      toast({
        title: "Deletion failed",
        description: "There was an error deleting the feature flag",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2">Loading feature flags...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 p-4 rounded-md border border-destructive text-destructive">
        <h3 className="font-bold mb-2">Error loading feature flags</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  const enabledFlags = flags.filter(f => f.is_enabled).length;
  const totalFlags = flags.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feature Flags Management</h1>
          <p className="text-muted-foreground">Control feature rollouts and experiments across the platform</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Flag
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Feature Flag</DialogTitle>
              <DialogDescription>
                Create a new feature flag to control feature rollouts and experiments.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. ENABLE_NEW_DASHBOARD"
                  value={newFlag.name}
                  onChange={(e) => setNewFlag(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of what this flag controls"
                  value={newFlag.description}
                  onChange={(e) => setNewFlag(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rollout">Rollout Percentage</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="rollout"
                    type="number"
                    min="0"
                    max="100"
                    value={newFlag.rollout_percentage}
                    onChange={(e) => setNewFlag(prev => ({ ...prev, rollout_percentage: parseInt(e.target.value) || 0 }))}
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Target Roles (optional)</Label>
                <Select
                  value={newFlag.target_roles.length > 0 ? newFlag.target_roles.join(',') : ''}
                  onValueChange={(value) => setNewFlag(prev => ({ 
                    ...prev, 
                    target_roles: value ? value.split(',') : [] 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select roles (leave empty for all roles)" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {newFlag.target_roles.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {newFlag.target_roles.map(role => (
                      <Badge key={role} variant="secondary" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateFlag} disabled={createLoading}>
                {createLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Flag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFlags}</div>
            <p className="text-xs text-muted-foreground">Feature flags configured</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enabled</CardTitle>
            <ToggleRight className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledFlags}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disabled</CardTitle>
            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFlags - enabledFlags}</div>
            <p className="text-xs text-muted-foreground">Currently inactive</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Flags List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Feature Flags
          </CardTitle>
          <CardDescription>
            Manage feature rollouts, experiments, and access control across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {flags.length === 0 ? (
            <div className="text-center p-6 bg-muted/30 rounded-md">
              <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No feature flags configured yet</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Flag
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {flags.map((flag) => (
                <div key={flag.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{flag.name}</h3>
                        <Badge variant={flag.is_enabled ? "default" : "outline"}>
                          {flag.is_enabled ? "Enabled" : "Disabled"}
                        </Badge>
                        {flag.rollout_percentage < 100 && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Percent className="h-3 w-3" />
                            {flag.rollout_percentage}%
                          </Badge>
                        )}
                      </div>
                      {flag.description && (
                        <p className="text-sm text-muted-foreground mb-2">{flag.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {flag.target_roles && flag.target_roles.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>Roles:</span>
                            <div className="flex gap-1">
                              {flag.target_roles.map((role) => (
                                <Badge key={role} variant="outline" className="text-xs px-1 py-0">
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Created: {new Date(flag.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {updatingFlag === flag.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Switch
                            checked={flag.is_enabled}
                            onCheckedChange={() => handleToggleFlag(flag.id, flag.is_enabled)}
                            disabled={updatingFlag !== null}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFlag(flag.id, flag.name)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};