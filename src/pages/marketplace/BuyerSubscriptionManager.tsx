import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Settings, DollarSign, Pause, Play } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/modules/auth/hooks';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const subscriptionSchema = z.object({
  package_id: z.string().min(1, 'Package is required'),
  auto_buy: z.boolean().default(false),
  daily_cap_cents: z.coerce.number().optional(),
  monthly_cap_cents: z.coerce.number().optional(),
  is_paused: z.boolean().default(false)
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

export const BuyerSubscriptionManager: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubscribeDialogOpen, setIsSubscribeDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<any>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema)
  });

  // Get user's company ID
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch buyer account and subscriptions
  const { data: buyerAccount, isLoading: accountLoading } = useQuery({
    queryKey: ['buyer-account', userProfile?.company_id],
    queryFn: async () => {
      if (!userProfile?.company_id) return null;
      const { data, error } = await supabase
        .from('buyer_accounts')
        .select(`
          *,
          buyer_package_subscriptions (
            *,
            lead_packages (
              name,
              description,
              price_per_lead,
              monthly_price
            )
          )
        `)
        .eq('id', userProfile.company_id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!userProfile?.company_id
  });

  // Fetch available packages
  const { data: availablePackages } = useQuery({
    queryKey: ['available-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_packages')
        .select('*')
        .eq('is_active', true)
        .order('priority_level', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Create subscription
  const createSubscriptionMutation = useMutation({
    mutationFn: async (data: SubscriptionFormData & { buyer_id: string }) => {
      const { error } = await supabase
        .from('buyer_package_subscriptions')
        .insert({
          buyer_id: data.buyer_id,
          package_id: data.package_id,
          auto_buy: data.auto_buy,
          daily_cap_cents: data.daily_cap_cents ? data.daily_cap_cents * 100 : null,
          monthly_cap_cents: data.monthly_cap_cents ? data.monthly_cap_cents * 100 : null,
          status: data.is_paused ? 'paused' : 'active',
          start_date: new Date().toISOString()
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-account'] });
      setIsSubscribeDialogOpen(false);
      reset();
      toast.success('Package subscription created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create subscription: ' + error.message);
    }
  });

  // Update subscription
  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<SubscriptionFormData> & { id: string }) => {
      const updateData: any = {};
      if (data.auto_buy !== undefined) updateData.auto_buy = data.auto_buy;
      if (data.daily_cap_cents !== undefined) updateData.daily_cap_cents = data.daily_cap_cents ? data.daily_cap_cents * 100 : null;
      if (data.monthly_cap_cents !== undefined) updateData.monthly_cap_cents = data.monthly_cap_cents ? data.monthly_cap_cents * 100 : null;
      if (data.is_paused !== undefined) updateData.status = data.is_paused ? 'paused' : 'active';

      const { error } = await supabase
        .from('buyer_package_subscriptions')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-account'] });
      setEditingSubscription(null);
      reset();
      toast.success('Subscription updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update subscription: ' + error.message);
    }
  });

  // Toggle pause/resume subscription
  const toggleSubscriptionMutation = useMutation({
    mutationFn: async ({ id, isPaused }: { id: string; isPaused: boolean }) => {
      const { error } = await supabase
        .from('buyer_package_subscriptions')
        .update({ status: isPaused ? 'paused' : 'active' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-account'] });
      toast.success('Subscription status updated');
    },
    onError: (error) => {
      toast.error('Failed to update subscription: ' + error.message);
    }
  });

  const onSubmit = (data: SubscriptionFormData) => {
    if (!userProfile?.company_id) {
      toast.error('Company ID not found');
      return;
    }

    if (editingSubscription) {
      updateSubscriptionMutation.mutate({ ...data, id: editingSubscription.id });
    } else {
      createSubscriptionMutation.mutate({ ...data, buyer_id: userProfile.company_id });
    }
  };

  const openEditDialog = (subscription: any) => {
    setEditingSubscription(subscription);
    setValue('package_id', subscription.package_id);
    setValue('auto_buy', subscription.auto_buy || false);
    setValue('daily_cap_cents', subscription.daily_cap_cents ? subscription.daily_cap_cents / 100 : undefined);
    setValue('monthly_cap_cents', subscription.monthly_cap_cents ? subscription.monthly_cap_cents / 100 : undefined);
    setValue('is_paused', subscription.status === 'paused');
  };

  if (accountLoading) {
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

  const subscriptions = buyerAccount?.buyer_package_subscriptions || [];
  const subscribedPackageIds = subscriptions.map(sub => sub.package_id);
  const unsubscribedPackages = availablePackages?.filter(pkg => !subscribedPackageIds.includes(pkg.id)) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Package Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage your lead package subscriptions and settings
          </p>
        </div>
        {unsubscribedPackages.length > 0 && (
          <Dialog open={isSubscribeDialogOpen || !!editingSubscription} onOpenChange={(open) => {
            if (!open) {
              setIsSubscribeDialogOpen(false);
              setEditingSubscription(null);
              reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsSubscribeDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Subscribe to Package
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingSubscription ? 'Edit Subscription' : 'Subscribe to Package'}
                </DialogTitle>
                <DialogDescription>
                  Configure your subscription settings and spending limits
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {!editingSubscription && (
                  <div>
                    <Label htmlFor="package_id">Select Package</Label>
                    <Select onValueChange={(value) => setValue('package_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a package" />
                      </SelectTrigger>
                      <SelectContent>
                        {unsubscribedPackages.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name} - NOK {pkg.price_per_lead}/lead
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.package_id && (
                      <p className="text-sm text-destructive">{errors.package_id.message}</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="daily_cap_cents">Daily Spending Limit (NOK)</Label>
                    <Input {...register('daily_cap_cents')} type="number" step="0.01" placeholder="No limit" />
                  </div>
                  
                  <div>
                    <Label htmlFor="monthly_cap_cents">Monthly Spending Limit (NOK)</Label>
                    <Input {...register('monthly_cap_cents')} type="number" step="0.01" placeholder="No limit" />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch {...register('auto_buy')} />
                  <Label htmlFor="auto_buy">Enable Auto-Purchase</Label>
                  <p className="text-xs text-muted-foreground ml-2">
                    Automatically purchase leads when they match your criteria
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch {...register('is_paused')} />
                  <Label htmlFor="is_paused">Start Paused</Label>
                  <p className="text-xs text-muted-foreground ml-2">
                    You can activate this subscription later
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsSubscribeDialogOpen(false);
                    setEditingSubscription(null);
                    reset();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingSubscription ? 'Update' : 'Subscribe'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Account Info */}
      {buyerAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
            <CardDescription>Your current account status and budget</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium">Current Budget:</span>
                <p className="text-2xl font-bold text-primary">
                  NOK {buyerAccount.current_budget?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium">Daily Budget:</span>
                <p className="text-lg">
                  NOK {buyerAccount.daily_budget?.toFixed(2) || 'Unlimited'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium">Monthly Budget:</span>
                <p className="text-lg">
                  NOK {buyerAccount.monthly_budget?.toFixed(2) || 'Unlimited'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Subscriptions */}
      <div className="grid gap-4">
        {subscriptions.map((subscription) => (
          <Card key={subscription.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {subscription.lead_packages?.name}
                    <Badge variant={subscription.status === 'active' ? "default" : "secondary"}>
                      {subscription.status || 'active'}
                    </Badge>
                    {(subscription as any).auto_buy && (
                      <Badge variant="outline">Auto-Buy</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {subscription.lead_packages?.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(subscription)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={subscription.status === 'paused' ? "default" : "outline"}
                    onClick={() => toggleSubscriptionMutation.mutate({
                      id: subscription.id,
                      isPaused: subscription.status !== 'paused'
                    })}
                  >
                    {subscription.status === 'paused' ? (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Price per Lead:</span>
                  <p className="text-lg font-bold text-primary">
                    NOK {subscription.lead_packages?.price_per_lead}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Daily Cap:</span>
                  <p>{(subscription as any).daily_cap_cents ? `NOK ${((subscription as any).daily_cap_cents / 100).toFixed(2)}` : 'Unlimited'}</p>
                </div>
                <div>
                  <span className="font-medium">Monthly Cap:</span>
                  <p>{(subscription as any).monthly_cap_cents ? `NOK ${((subscription as any).monthly_cap_cents / 100).toFixed(2)}` : 'Unlimited'}</p>
                </div>
                <div>
                  <span className="font-medium">Auto-Purchase:</span>
                  <p>{(subscription as any).auto_buy ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {subscriptions.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No active subscriptions</h3>
              <p className="text-muted-foreground mb-4">
                Subscribe to lead packages to start receiving and purchasing leads automatically.
              </p>
              {unsubscribedPackages.length > 0 && (
                <Button onClick={() => setIsSubscribeDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Subscribe to Your First Package
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};