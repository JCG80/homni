import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const packageSchema = z.object({
  name: z.string().min(1, 'Package name is required'),
  description: z.string().optional(),
  price_per_lead: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  monthly_price: z.coerce.number().optional(),
  lead_cap_per_day: z.coerce.number().optional(),
  lead_cap_per_month: z.coerce.number().optional(),
  priority_level: z.coerce.number().min(1).max(10).default(1),
  is_active: z.boolean().default(true)
});

type PackageFormData = z.infer<typeof packageSchema>;

export const PackageManagement: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: packages, isLoading } = useQuery({
    queryKey: ['lead-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_packages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema)
  });

  const createPackageMutation = useMutation({
    mutationFn: async (data: PackageFormData) => {
      // Ensure required fields are present
      const packageData = {
        name: data.name,
        price_per_lead: data.price_per_lead,
        description: data.description || null,
        monthly_price: data.monthly_price || null,
        lead_cap_per_day: data.lead_cap_per_day || null,
        lead_cap_per_month: data.lead_cap_per_month || null,
        priority_level: data.priority_level || 1,
        is_active: data.is_active !== false
      };
      
      const { error } = await supabase
        .from('lead_packages')
        .insert(packageData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-packages'] });
      setIsCreateDialogOpen(false);
      reset();
      toast.success('Package created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create package: ' + error.message);
    }
  });

  const updatePackageMutation = useMutation({
    mutationFn: async ({ id, ...data }: PackageFormData & { id: string }) => {
      const { error } = await supabase
        .from('lead_packages')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-packages'] });
      setEditingPackage(null);
      reset();
      toast.success('Package updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update package: ' + error.message);
    }
  });

  const deletePackageMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lead_packages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-packages'] });
      toast.success('Package deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete package: ' + error.message);
    }
  });

  const onSubmit = (data: PackageFormData) => {
    if (editingPackage) {
      updatePackageMutation.mutate({ ...data, id: editingPackage.id });
    } else {
      createPackageMutation.mutate(data);
    }
  };

  const openEditDialog = (pkg: any) => {
    setEditingPackage(pkg);
    Object.keys(pkg).forEach(key => {
      setValue(key as keyof PackageFormData, pkg[key]);
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Package Management</h1>
          <p className="text-muted-foreground">
            Create and manage lead packages for buyers
          </p>
        </div>
        <Dialog open={isCreateDialogOpen || !!editingPackage} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingPackage(null);
            reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? 'Edit Package' : 'Create New Package'}
              </DialogTitle>
              <DialogDescription>
                Configure pricing and limits for lead packages
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Package Name</Label>
                  <Input {...register('name')} placeholder="Basic Package" />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="price_per_lead">Price per Lead (NOK)</Label>
                  <Input {...register('price_per_lead')} type="number" step="0.01" placeholder="100.00" />
                  {errors.price_per_lead && (
                    <p className="text-sm text-destructive">{errors.price_per_lead.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea {...register('description')} placeholder="Package description..." />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="monthly_price">Monthly Fee (optional)</Label>
                  <Input {...register('monthly_price')} type="number" step="0.01" placeholder="0" />
                </div>
                
                <div>
                  <Label htmlFor="lead_cap_per_day">Daily Lead Limit</Label>
                  <Input {...register('lead_cap_per_day')} type="number" placeholder="Unlimited" />
                </div>
                
                <div>
                  <Label htmlFor="lead_cap_per_month">Monthly Lead Limit</Label>
                  <Input {...register('lead_cap_per_month')} type="number" placeholder="Unlimited" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority_level">Priority Level (1-10)</Label>
                  <Input {...register('priority_level')} type="number" min="1" max="10" defaultValue="1" />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch {...register('is_active')} defaultChecked />
                  <Label htmlFor="is_active">Active Package</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false);
                  setEditingPackage(null);
                  reset();
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPackage ? 'Update' : 'Create'} Package
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {packages?.map((pkg) => (
          <Card key={pkg.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {pkg.name}
                    <Badge variant={pkg.is_active ? "default" : "secondary"}>
                      {pkg.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">
                      Priority {pkg.priority_level}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(pkg)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => deletePackageMutation.mutate(pkg.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Price per Lead:</span>
                  <p className="text-lg font-bold text-primary">
                    NOK {pkg.price_per_lead}
                  </p>
                </div>
                
                {pkg.monthly_price && (
                  <div>
                    <span className="font-medium">Monthly Fee:</span>
                    <p className="text-lg font-bold">NOK {pkg.monthly_price}</p>
                  </div>
                )}
                
                <div>
                  <span className="font-medium">Daily Limit:</span>
                  <p>{pkg.lead_cap_per_day || 'Unlimited'}</p>
                </div>
                
                <div>
                  <span className="font-medium">Monthly Limit:</span>
                  <p>{pkg.lead_cap_per_month || 'Unlimited'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {packages?.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No packages created yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first lead package to start selling leads to buyers.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Package
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};