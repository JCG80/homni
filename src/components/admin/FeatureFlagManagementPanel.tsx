/**
 * PHASE 2: Feature Flag Management Panel  
 * Admin interface for managing feature flags and rollouts
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Users, Percent, Flag } from 'lucide-react';
import { useFeatureFlagManagement } from '@/hooks/useFeatureFlagNavigation';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface FeatureFlagConfig {
  name: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  targetRoles: string[];
  description?: string;
}

interface FeatureFlagManagementPanelProps {
  className?: string;
}

export const FeatureFlagManagementPanel: React.FC<FeatureFlagManagementPanelProps> = ({
  className
}) => {
  const { canManageFlags, upsertFeatureFlag, deleteFeatureFlag, getAllFeatureFlags } = useFeatureFlagManagement();
  const [flags, setFlags] = useState<FeatureFlagConfig[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlagConfig | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<FeatureFlagConfig>>({
    name: '',
    isEnabled: true,
    rolloutPercentage: 100,
    targetRoles: [],
    description: ''
  });

  const availableRoles = ['guest', 'user', 'company', 'content_editor', 'admin', 'master_admin'];

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    setLoading(true);
    try {
      const allFlags = await getAllFeatureFlags();
      setFlags(allFlags);
    } catch (error) {
      toast({
        title: 'Feil',
        description: 'Kunne ikke laste feature flags',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingFlag(null);
    setFormData({
      name: '',
      isEnabled: true,
      rolloutPercentage: 100,
      targetRoles: [],
      description: ''
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (flag: FeatureFlagConfig) => {
    setEditingFlag(flag);
    setFormData({ ...flag });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast({
        title: 'Feil',
        description: 'Feature flag navn er påkrevd',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const success = await upsertFeatureFlag(formData.name, formData);
      
      if (success) {
        await loadFlags();
        setIsDialogOpen(false);
        toast({
          title: 'Suksess',
          description: `Feature flag "${formData.name}" er oppdatert`,
          variant: 'default'
        });
      } else {
        toast({
          title: 'Feil',
          description: 'Kunne ikke lagre feature flag',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (flagName: string) => {
    if (!confirm(`Er du sikker på at du vil slette feature flag "${flagName}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const success = await deleteFeatureFlag(flagName);
      
      if (success) {
        await loadFlags();
        toast({
          title: 'Suksess',
          description: `Feature flag "${flagName}" er slettet`,
          variant: 'default'
        });
      } else {
        toast({
          title: 'Feil',
          description: 'Kunne ikke slette feature flag',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFlag = async (flagName: string, isEnabled: boolean) => {
    setLoading(true);
    try {
      const success = await upsertFeatureFlag(flagName, { isEnabled });
      
      if (success) {
        setFlags(prev => prev.map(flag => 
          flag.name === flagName ? { ...flag, isEnabled } : flag
        ));
        toast({
          title: 'Oppdatert',
          description: `Feature flag "${flagName}" er ${isEnabled ? 'aktivert' : 'deaktivert'}`,
          variant: 'default'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!canManageFlags) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Feature Flag-administrasjon</CardTitle>
          <CardDescription>
            Du har ikke tilgang til å administrere feature flags
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Feature Flag-administrasjon</CardTitle>
              <CardDescription>
                Administrer funksjonsbrytere og gradvis utrulling av nye funksjoner
              </CardDescription>
            </div>
            <Button onClick={handleCreateNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Ny Feature Flag
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {flags.map((flag) => (
              <div key={flag.name} className="flex items-center justify-between p-4 bg-card rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{flag.name}</h3>
                    {flag.isEnabled ? (
                      <Badge variant="default">
                        <Flag className="w-3 h-3 mr-1" />
                        Aktiv
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inaktiv</Badge>
                    )}
                    
                    {flag.rolloutPercentage < 100 && (
                      <Badge variant="outline" className="gap-1">
                        <Percent className="w-3 h-3" />
                        {flag.rolloutPercentage}% utrulling
                      </Badge>
                    )}
                    
                    {flag.targetRoles.length > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Users className="w-3 h-3" />
                        {flag.targetRoles.length} roller
                      </Badge>
                    )}
                  </div>
                  
                  {flag.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {flag.description}
                    </p>
                  )}
                  
                  {flag.targetRoles.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Målroller:</span>
                      {flag.targetRoles.map(role => (
                        <Badge key={role} variant="outline" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={flag.isEnabled}
                    onCheckedChange={(checked) => handleToggleFlag(flag.name, checked)}
                    disabled={loading}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(flag)}
                    disabled={loading}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(flag.name)}
                    disabled={loading}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {flags.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Ingen feature flags konfigurert</p>
                <Button variant="outline" onClick={handleCreateNew} className="mt-4">
                  Opprett din første feature flag
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingFlag ? 'Rediger Feature Flag' : 'Opprett Ny Feature Flag'}
            </DialogTitle>
            <DialogDescription>
              Konfigurer funksjonsbryter og utrullingsinnstillinger
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Navn</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="ENABLE_NEW_FEATURE"
                disabled={!!editingFlag} // Cannot edit name of existing flag
              />
            </div>

            <div>
              <Label htmlFor="description">Beskrivelse</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Beskrivelse av funksjonen..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isEnabled || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isEnabled: checked }))}
              />
              <Label>Aktivert</Label>
            </div>

            <div>
              <Label>Utrullingsprosent: {formData.rolloutPercentage}%</Label>
              <Slider
                value={[formData.rolloutPercentage || 100]}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, rolloutPercentage: value }))}
                max={100}
                min={0}
                step={5}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Målroller</Label>
              <Select 
                value={formData.targetRoles?.[0] || ''}
                onValueChange={(value) => {
                  if (value && !formData.targetRoles?.includes(value)) {
                    setFormData(prev => ({
                      ...prev,
                      targetRoles: [...(prev.targetRoles || []), value]
                    }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg rolle..." />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.filter(role => !formData.targetRoles?.includes(role)).map(role => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {formData.targetRoles && formData.targetRoles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.targetRoles.map(role => (
                    <Badge 
                      key={role} 
                      variant="outline" 
                      className="cursor-pointer"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          targetRoles: prev.targetRoles?.filter(r => r !== role) || []
                        }));
                      }}
                    >
                      {role} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Avbryt
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Lagrer...' : 'Lagre'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};