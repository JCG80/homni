import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, DollarSign, Activity, Pause, Play } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const BuyerManagement: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: buyers, isLoading } = useQuery({
    queryKey: ['buyer-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buyer_accounts')
        .select(`
          *,
          buyer_package_subscriptions (
            id,
            package_id,
            status,
            lead_packages (
              name,
              price_per_lead
            )
          ),
          buyer_spend_ledger (
            amount,
            created_at
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async ({ buyerId, amount }: { buyerId: string; amount: number }) => {
      const { error } = await supabase
        .from('buyer_accounts')
        .update({ current_budget: amount })
        .eq('id', buyerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-accounts'] });
      toast.success('Budget updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update budget: ' + error.message);
    }
  });

  const togglePauseMutation = useMutation({
    mutationFn: async ({ buyerId, paused }: { buyerId: string; paused: boolean }) => {
      const { error } = await supabase
        .from('buyer_accounts')
        .update({ pause_when_budget_exceeded: paused })
        .eq('id', buyerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-accounts'] });
      toast.success('Account status updated');
    },
    onError: (error) => {
      toast.error('Failed to update status: ' + error.message);
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-muted rounded"></div>
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
          <h1 className="text-3xl font-bold">Buyer Management</h1>
          <p className="text-muted-foreground">
            Manage buyer accounts, budgets, and subscriptions
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Buyers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{buyers?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {buyers?.filter(b => !b.pause_when_budget_exceeded).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              NOK {buyers?.reduce((sum, b) => sum + (b.current_budget || 0), 0).toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Leads sold</p>
          </CardContent>
        </Card>
      </div>

      {/* Buyer Accounts */}
      <div className="grid gap-4">
        {buyers?.map((buyer) => {
          const totalSpent = buyer.buyer_spend_ledger?.reduce((sum, ledger) => sum + Math.abs(ledger.amount), 0) || 0;
          const activeSubscriptions = buyer.buyer_package_subscriptions?.filter(sub => sub.status === 'active') || [];
          
          return (
            <Card key={buyer.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {buyer.company_name}
                      <Badge variant={buyer.pause_when_budget_exceeded ? "destructive" : "default"}>
                        {buyer.pause_when_budget_exceeded ? 'Paused' : 'Active'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {buyer.contact_email} • {buyer.contact_phone}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={buyer.pause_when_budget_exceeded ? "default" : "outline"}
                      onClick={() => togglePauseMutation.mutate({
                        buyerId: buyer.id,
                        paused: !buyer.pause_when_budget_exceeded
                      })}
                    >
                      {buyer.pause_when_budget_exceeded ? (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Activate
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm font-medium">Current Budget:</span>
                    <p className="text-lg font-bold text-primary">
                      NOK {buyer.current_budget?.toFixed(2) || '0.00'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        placeholder="Add funds"
                        className="h-8 text-xs"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const amount = parseFloat((e.target as HTMLInputElement).value);
                            if (amount > 0) {
                              updateBudgetMutation.mutate({
                                buyerId: buyer.id,
                                amount: (buyer.current_budget || 0) + amount
                              });
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Daily Limit:</span>
                    <p className="text-lg font-bold">
                      NOK {buyer.daily_budget?.toFixed(2) || 'Unlimited'}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Total Spent:</span>
                    <p className="text-lg font-bold">
                      NOK {totalSpent.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Active Packages:</span>
                    <div className="space-y-1">
                      {activeSubscriptions.map((sub) => (
                        <Badge key={sub.id} variant="outline" className="text-xs">
                          {sub.lead_packages?.name}
                        </Badge>
                      ))}
                      {activeSubscriptions.length === 0 && (
                        <p className="text-sm text-muted-foreground">No active subscriptions</p>
                      )}
                    </div>
                  </div>
                </div>

                {buyer.geographical_scope && buyer.geographical_scope.length > 0 && (
                  <div className="mt-4">
                    <span className="text-sm font-medium">Service Areas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {buyer.geographical_scope.map((area, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {buyers?.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No buyers registered yet</h3>
              <p className="text-muted-foreground">
                Buyer accounts will appear here once companies start purchasing leads.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};