import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { CompanyProfile } from '../../types/types';
import { CreditCard, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface BudgetManagementTabProps {
  company: CompanyProfile;
  onUpdate: () => void;
}

interface BudgetAdjustment {
  type: 'credit' | 'debit' | 'set';
  amount: number;
  description: string;
}

export function BudgetManagementTab({ company, onUpdate }: BudgetManagementTabProps) {
  const { toast } = useToast();
  const [budgetAdjustment, setBudgetAdjustment] = useState<BudgetAdjustment>({
    type: 'credit',
    amount: 0,
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const adjustBudget = async () => {
    if (!budgetAdjustment.amount || !budgetAdjustment.description) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      let newBudget: number;
      let transactionAmount: number;

      switch (budgetAdjustment.type) {
        case 'credit':
          newBudget = (company.current_budget || 0) + budgetAdjustment.amount;
          transactionAmount = budgetAdjustment.amount;
          break;
        case 'debit':
          newBudget = (company.current_budget || 0) - budgetAdjustment.amount;
          transactionAmount = -budgetAdjustment.amount;
          break;
        case 'set':
          newBudget = budgetAdjustment.amount;
          transactionAmount = budgetAdjustment.amount - (company.current_budget || 0);
          break;
        default:
          throw new Error('Invalid adjustment type');
      }

      // Update company budget
      const { error: updateError } = await supabase
        .from('company_profiles')
        .update({
          current_budget: newBudget,
          updated_at: new Date().toISOString()
        })
        .eq('id', company.id);

      if (updateError) throw updateError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from('company_budget_transactions')
        .insert({
          company_id: company.id,
          transaction_type: transactionAmount >= 0 ? 'credit' : 'debit',
          amount: Math.abs(transactionAmount),
          balance_before: company.current_budget || 0,
          balance_after: newBudget,
          description: `Admin adjustment: ${budgetAdjustment.description}`
        });

      if (transactionError) throw transactionError;

      // Reset form
      setBudgetAdjustment({
        type: 'credit',
        amount: 0,
        description: ''
      });

      onUpdate();
      toast({
        title: "Success",
        description: "Budget adjusted successfully"
      });

    } catch (error) {
      logger.error('Error adjusting budget:', error);
      toast({
        title: "Error",
        description: "Failed to adjust budget",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateCompanySettings = async (settings: Partial<CompanyProfile>) => {
    try {
      const { error } = await supabase
        .from('company_profiles')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', company.id);

      if (error) throw error;

      onUpdate();
      toast({
        title: "Success",
        description: "Company settings updated successfully"
      });

    } catch (error) {
      logger.error('Error updating company settings:', error);
      toast({
        title: "Error",
        description: "Failed to update company settings",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">
                  kr {(company.current_budget || 0).toLocaleString('no-NO')}
                </div>
                <div className="text-xs text-muted-foreground">Current Budget</div>
              </div>
              {(company.current_budget || 0) <= (company.low_budget_threshold || 0) && (
                <AlertCircle className="h-4 w-4 text-destructive ml-auto" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  kr {(company.daily_budget || 0).toLocaleString('no-NO')}
                </div>
                <div className="text-xs text-muted-foreground">Daily Budget</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  kr {(company.lead_cost_per_unit || 0).toLocaleString('no-NO')}
                </div>
                <div className="text-xs text-muted-foreground">Cost Per Lead</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Adjustment */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Adjustment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Type</Label>
              <Select 
                value={budgetAdjustment.type} 
                onValueChange={(value: 'credit' | 'debit' | 'set') => setBudgetAdjustment(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Add Budget</SelectItem>
                  <SelectItem value="debit">Subtract Budget</SelectItem>
                  <SelectItem value="set">Set Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Amount (NOK)</Label>
              <Input
                type="number"
                value={budgetAdjustment.amount || ''}
                onChange={(e) => setBudgetAdjustment(prev => ({ ...prev, amount: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={budgetAdjustment.description}
                onChange={(e) => setBudgetAdjustment(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Reason for adjustment"
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={adjustBudget} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Applying...' : 'Apply'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Company Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Auto-accept leads</span>
                <p className="text-sm text-muted-foreground">
                  Automatically purchase qualified leads within budget
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => updateCompanySettings({
                  auto_accept_leads: !company.auto_accept_leads
                })}
              >
                {company.auto_accept_leads ? 'Disable' : 'Enable'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Budget alerts</span>
                <p className="text-sm text-muted-foreground">
                  Send notifications when budget runs low
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => updateCompanySettings({
                  budget_alerts_enabled: !company.budget_alerts_enabled
                })}
              >
                {company.budget_alerts_enabled ? 'Disable' : 'Enable'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Company status</span>
                <p className="text-sm text-muted-foreground">
                  {company.status === 'active' ? 'Company is active and can receive leads' : 'Company is inactive'}
                </p>
              </div>
              <Button
                variant={company.status === 'active' ? 'destructive' : 'default'}
                onClick={() => updateCompanySettings({
                  status: company.status === 'active' ? 'inactive' : 'active'
                })}
              >
                {company.status === 'active' ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}