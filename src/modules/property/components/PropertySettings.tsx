import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, Trash2, Edit3, Home, DollarSign, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks';
import { Property } from '../types/propertyTypes';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';

interface PropertySettingsProps {
  propertyId?: string;
}

export const PropertySettings: React.FC<PropertySettingsProps> = ({ propertyId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch property data
  const { data: property, isLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      return data as Property;
    },
    enabled: !!propertyId && !!user?.id
  });

  // Form data state
  const [formData, setFormData] = useState<Partial<Property>>({});

  // Update form data when property loads
  React.useEffect(() => {
    if (property) {
      setFormData(property);
    }
  }, [property]);

  // Update property mutation
  const updatePropertyMutation = useMutation({
    mutationFn: async (updates: Partial<Property>) => {
      if (!propertyId) throw new Error('No property ID');
      
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', propertyId)
        .eq('user_id', user?.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Eiendom oppdatert');
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error('Kunne ikke oppdatere eiendom');
      console.error('Error updating property:', error);
    }
  });

  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async () => {
      if (!propertyId) throw new Error('No property ID');
      
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Eiendom slettet');
      navigate('/properties');
    },
    onError: (error) => {
      toast.error('Kunne ikke slette eiendom');
      console.error('Error deleting property:', error);
    }
  });

  const handleSave = () => {
    if (!formData) return;
    updatePropertyMutation.mutate(formData);
  };

  const handleDelete = () => {
    deletePropertyMutation.mutate();
  };

  const getPropertyTypeLabel = (type: string) => {
    const types = {
      apartment: 'Leilighet',
      house: 'Enebolig', 
      townhouse: 'Rekkehus',
      cabin: 'Hytte',
      commercial: 'Næring',
      land: 'Tomt'
    };
    return types[type as keyof typeof types] || type;
  };

  const getStatusLabel = (status: string) => {
    const statuses = {
      owned: 'Eiet',
      rented: 'Utleid',
      for_sale: 'Til salgs',
      sold: 'Solgt',
      under_renovation: 'Under renovering'
    };
    return statuses[status as keyof typeof statuses] || status;
  };

  if (!propertyId) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Ingen eiendom valgt</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!property) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Eiendom ikke funnet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Innstillinger</h2>
          <p className="text-muted-foreground">
            Administrer innstillinger for {property.name}
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Avbryt
              </Button>
              <Button onClick={handleSave} disabled={updatePropertyMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updatePropertyMutation.isPending ? 'Lagrer...' : 'Lagre'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit3 className="w-4 h-4 mr-2" />
              Rediger
            </Button>
          )}
        </div>
      </div>

      {/* Property Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Eiendomsinformasjon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Navn</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Eiendomsnavn"
                />
              ) : (
                <p className="text-sm font-medium">{property.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              {isEditing ? (
                <Select
                  value={formData.type || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Leilighet</SelectItem>
                    <SelectItem value="house">Enebolig</SelectItem>
                    <SelectItem value="townhouse">Rekkehus</SelectItem>
                    <SelectItem value="cabin">Hytte</SelectItem>
                    <SelectItem value="commercial">Næring</SelectItem>
                    <SelectItem value="land">Tomt</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm font-medium">{getPropertyTypeLabel(property.type)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              {isEditing ? (
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Adresse"
                />
              ) : (
                <p className="text-sm font-medium">{property.address || 'Ikke angitt'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Størrelse (m²)</Label>
              {isEditing ? (
                <Input
                  id="size"
                  type="number"
                  value={formData.size || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="0"
                />
              ) : (
                <p className="text-sm font-medium">{property.size ? `${property.size} m²` : 'Ikke angitt'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_date">Kjøpsdato</Label>
              {isEditing ? (
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
                />
              ) : (
                <p className="text-sm font-medium">
                  {property.purchase_date 
                    ? new Date(property.purchase_date).toLocaleDateString('nb-NO')
                    : 'Ikke angitt'
                  }
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_value">Nåværende verdi (NOK)</Label>
              {isEditing ? (
                <Input
                  id="current_value"
                  type="number"
                  value={formData.current_value || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_value: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="0"
                />
              ) : (
                <p className="text-sm font-medium">
                  {property.current_value 
                    ? new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' }).format(property.current_value)
                    : 'Ikke angitt'
                  }
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beskrivelse</Label>
            {isEditing ? (
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Beskrivelse av eiendommen"
                rows={3}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {property.description || 'Ingen beskrivelse'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status & Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Status og metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Status</Label>
              <p className="font-medium">
                <Badge variant="outline">{getStatusLabel(property.status || 'owned')}</Badge>
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Opprettet</Label>
              <p className="font-medium">
                {new Date(property.created_at).toLocaleDateString('nb-NO')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Farlig sone</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Å slette en eiendom vil permanent fjerne all tilknyttet data, inkludert dokumenter og vedlikeholdslogger. 
              Denne handlingen kan ikke angres.
            </AlertDescription>
          </Alert>

          <div className="mt-4">
            {!showDeleteConfirm ? (
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Slett eiendom
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={deletePropertyMutation.isPending}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {deletePropertyMutation.isPending ? 'Sletter...' : 'Bekreft sletting'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Avbryt
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};