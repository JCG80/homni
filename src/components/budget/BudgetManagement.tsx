/**
 * Company budget management component
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Plus,
  Settings,
  DollarSign
} from 'lucide-react';

interface BudgetInfo {
  daily_budget: number;
  current_budget: number;
  monthly_budget: number;
  auto_accept_leads: boolean;
  lead_cost_per_unit: number;
  budget_alerts_enabled: boolean;
  low_budget_threshold: number;
}

interface BudgetTransaction {
  id: string;
  transaction_type: 'debit' | 'credit' | 'adjustment';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  created_at: string;
  lead_id?: string;
}

export const BudgetManagement: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [budgetInfo, setBudgetInfo] = useState<BudgetInfo | null>(null);
  const [transactions, setTransactions] = useState<BudgetTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [addAmount, setAddAmount] = useState('');

  const fetchBudgetData = async () => {
    if (!profile?.company_id) return;

    try {
      setLoading(true);

      // Fetch company budget info
      const { data: company, error: companyError } = await supabase
        .from('company_profiles')
        .select(`
          daily_budget,
          current_budget,
          monthly_budget,
          auto_accept_leads,
          lead_cost_per_unit,
          budget_alerts_enabled,
          low_budget_threshold
        `)
        .eq('id', profile.company_id)
        .single();

      if (companyError) throw companyError;

      setBudgetInfo(company);

      // Fetch recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('company_budget_transactions')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (transactionsError) throw transactionsError;

      setTransactions((transactionsData || []).map(transaction => ({
        ...transaction,
        transaction_type: transaction.transaction_type as 'debit' | 'credit' | 'adjustment'
      })));

    } catch (error) {
      console.error('Error fetching budget data:', error);
      toast({
        title: "Error",
        description: "Failed to load budget information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBudgetSettings = async (settings: Partial<BudgetInfo>) => {
    if (!profile?.company_id) return;

    try {
      setUpdating(true);

      const { error } = await supabase
        .from('company_profiles')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.company_id);

      if (error) throw error;

      await fetchBudgetData();
      toast({
        title: "Success", 
        description: "Budget settings updated successfully"
      });

    } catch (error) {
      console.error('Error updating budget settings:', error);
      toast({
        title: "Error",
        description: "Failed to update budget settings",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const addBudget = async () => {
    if (!profile?.company_id || !addAmount || isNaN(Number(addAmount))) {
      toast({
        title: "Error",
        description: "Please enter a valid amount", 
        variant: "destructive"
      });
      return;
    }

    const amount = Number(addAmount);
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "Amount must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    try {
      setUpdating(true);

      // Add budget via transaction
      const { error } = await supabase
        .from('company_budget_transactions')
        .insert({
          company_id: profile.company_id,
          transaction_type: 'credit',
          amount: amount,
          balance_before: budgetInfo?.current_budget || 0,
          balance_after: (budgetInfo?.current_budget || 0) + amount,
          description: `Budget top-up: +kr ${amount}`
        });

      if (error) throw error;

      // Update company budget
      await supabase
        .from('company_profiles')
        .update({
          current_budget: (budgetInfo?.current_budget || 0) + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.company_id);

      setAddAmount('');
      await fetchBudgetData();
      toast({
        title: "Success",
        description: `Successfully added kr ${amount} to budget`
      });

    } catch (error) {
      console.error('Error adding budget:', error);
      toast({
        title: "Error", 
        description: "Failed to add budget",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, [profile]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!budgetInfo) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            No budget information available
          </div>
        </CardContent>
      </Card>
    );
  }

  const isLowBudget = budgetInfo.current_budget <= budgetInfo.low_budget_threshold;
  const budgetUtilization = budgetInfo.daily_budget > 0 
    ? ((budgetInfo.daily_budget - budgetInfo.current_budget) / budgetInfo.daily_budget) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={isLowBudget ? 'border-destructive' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Budget</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              kr {budgetInfo.current_budget.toLocaleString('no-NO')}
            </div>
            {isLowBudget && (
              <div className="flex items-center text-destructive text-sm mt-2">
                <AlertCircle className="h-3 w-3 mr-1" />
                Low budget warning
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Budget</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              kr {budgetInfo.daily_budget.toLocaleString('no-NO')}
            </div>
            <p className="text-xs text-muted-foreground">
              {budgetUtilization.toFixed(1)}% utilized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost per Lead</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              kr {budgetInfo.lead_cost_per_unit.toLocaleString('no-NO')}
            </div>
            <p className="text-xs text-muted-foreground">
              Per assigned lead
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Add Budget</label>
              <Input
                type="number"
                placeholder="Amount in NOK"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button 
              onClick={addBudget} 
              disabled={updating || !addAmount}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Budget
            </Button>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Auto-accept leads</label>
              <div className="flex items-center gap-2">
                <Badge variant={budgetInfo.auto_accept_leads ? 'default' : 'secondary'}>
                  {budgetInfo.auto_accept_leads ? 'Enabled' : 'Disabled'}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateBudgetSettings({ 
                    auto_accept_leads: !budgetInfo.auto_accept_leads 
                  })}
                  disabled={updating}
                >
                  Toggle
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Budget alerts</label>
              <div className="flex items-center gap-2">
                <Badge variant={budgetInfo.budget_alerts_enabled ? 'default' : 'secondary'}>
                  {budgetInfo.budget_alerts_enabled ? 'Enabled' : 'Disabled'}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateBudgetSettings({ 
                    budget_alerts_enabled: !budgetInfo.budget_alerts_enabled 
                  })}
                  disabled={updating}
                >
                  Toggle
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-1 rounded-full ${
                      transaction.transaction_type === 'credit' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.transaction_type === 'credit' ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString('no-NO', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${
                      transaction.transaction_type === 'credit' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.transaction_type === 'credit' ? '+' : '-'}kr {Math.abs(transaction.amount).toLocaleString('no-NO')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Balance: kr {transaction.balance_after.toLocaleString('no-NO')}
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