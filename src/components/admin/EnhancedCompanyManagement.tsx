/**
 * Enhanced company management with budget controls and lead reassignment
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings,
  CreditCard,
  Users,
  ToggleLeft,
  ToggleRight,
  Plus,
  Pencil,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface CompanyProfile {
  id: string;
  name: string;
  status: string;
  email: string;
  phone: string;
  tags: string[];
  current_budget: number;
  daily_budget: number;
  monthly_budget: number;
  lead_cost_per_unit: number;
  auto_accept_leads: boolean;
  budget_alerts_enabled: boolean;
  low_budget_threshold: number;
  created_at: string;
  updated_at: string;
}

interface BudgetAdjustment {
  companyId: string;
  type: 'credit' | 'debit' | 'set';
  amount: number;
  description: string;
}

export const EnhancedCompanyManagement: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [selectedCompany, setSelectedCompany] = useState<CompanyProfile | null>(null);
  const [budgetAdjustment, setBudgetAdjustment] = useState<BudgetAdjustment>({
    companyId: '',
    type: 'credit',
    amount: 0,
    description: ''
  });

  const fetchCompanies = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('company_profiles')
        .select(`
          id,
          name,
          status,
          email,
          phone,
          tags,
          current_budget,
          daily_budget,
          monthly_budget,
          lead_cost_per_unit,
          auto_accept_leads,
          budget_alerts_enabled,
          low_budget_threshold,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCompanies(data || []);

    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyStatus = async (companyId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('company_profiles')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId);

      if (error) throw error;

      await fetchCompanies();
      toast({
        title: "Success",
        description: `Company ${status === 'active' ? 'activated' : 'deactivated'} successfully`
      });

    } catch (error) {
      console.error('Error updating company status:', error);
      toast({
        title: "Error",
        description: "Failed to update company status", 
        variant: "destructive"
      });
    }
  };

  const adjustBudget = async () => {
    if (!budgetAdjustment.companyId || !budgetAdjustment.amount || !budgetAdjustment.description) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const company = companies.find(c => c.id === budgetAdjustment.companyId);
      if (!company) throw new Error('Company not found');

      let newBudget: number;
      let transactionAmount: number;

      switch (budgetAdjustment.type) {
        case 'credit':
          newBudget = company.current_budget + budgetAdjustment.amount;
          transactionAmount = budgetAdjustment.amount;
          break;
        case 'debit':
          newBudget = company.current_budget - budgetAdjustment.amount;
          transactionAmount = -budgetAdjustment.amount;
          break;
        case 'set':
          newBudget = budgetAdjustment.amount;
          transactionAmount = budgetAdjustment.amount - company.current_budget;
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
        .eq('id', budgetAdjustment.companyId);

      if (updateError) throw updateError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from('company_budget_transactions')
        .insert({
          company_id: budgetAdjustment.companyId,
          transaction_type: transactionAmount >= 0 ? 'credit' : 'debit',
          amount: Math.abs(transactionAmount),
          balance_before: company.current_budget,
          balance_after: newBudget,
          description: `Admin adjustment: ${budgetAdjustment.description}`
        });

      if (transactionError) throw transactionError;

      // Reset form
      setBudgetAdjustment({
        companyId: '',
        type: 'credit',
        amount: 0,
        description: ''
      });

      await fetchCompanies();
      toast({
        title: "Success",
        description: "Budget adjusted successfully"
      });

    } catch (error) {
      console.error('Error adjusting budget:', error);
      toast({
        title: "Error",
        description: "Failed to adjust budget",
        variant: "destructive"
      });
    }
  };

  const updateCompanySettings = async (companyId: string, settings: Partial<CompanyProfile>) => {
    try {
      const { error } = await supabase
        .from('company_profiles')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId);

      if (error) throw error;

      await fetchCompanies();
      toast({
        title: "Success",
        description: "Company settings updated successfully"
      });

    } catch (error) {
      console.error('Error updating company settings:', error);
      toast({
        title: "Error",
        description: "Failed to update company settings",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading companies...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">{companies.length}</div>
                <div className="text-xs text-muted-foreground">Total Companies</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <ToggleRight className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {companies.filter(c => c.status === 'active').length}
                </div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold text-muted-foreground">
                  {companies.filter(c => c.status === 'inactive').length}
                </div>
                <div className="text-xs text-muted-foreground">Inactive</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">
                  kr {companies.reduce((sum, c) => sum + (c.current_budget || 0), 0).toLocaleString('no-NO')}
                </div>
                <div className="text-xs text-muted-foreground">Total Budget</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Adjustment */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Company</Label>
              <Select 
                value={budgetAdjustment.companyId} 
                onValueChange={(value) => setBudgetAdjustment(prev => ({ ...prev, companyId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name} (kr {company.current_budget?.toLocaleString('no-NO') || '0'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
              <Button onClick={adjustBudget} className="w-full">
                Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies List */}
      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
        </CardHeader>
        <CardContent>
          {companies.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No companies found
            </div>
          ) : (
            <div className="space-y-4">
              {companies.map((company) => (
                <div key={company.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{company.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {company.email} • {company.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                        {company.status}
                      </Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedCompany(company)}
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Company Settings: {company.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span>Status</span>
                              <Button
                                size="sm"
                                variant={company.status === 'active' ? 'destructive' : 'default'}
                                onClick={() => updateCompanyStatus(
                                  company.id, 
                                  company.status === 'active' ? 'inactive' : 'active'
                                )}
                              >
                                {company.status === 'active' ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>

                            <div className="flex items-center justify-between">
                              <span>Auto-accept leads</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCompanySettings(company.id, {
                                  auto_accept_leads: !company.auto_accept_leads
                                })}
                              >
                                {company.auto_accept_leads ? 'Disable' : 'Enable'}
                              </Button>
                            </div>

                            <div className="flex items-center justify-between">
                              <span>Budget alerts</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCompanySettings(company.id, {
                                  budget_alerts_enabled: !company.budget_alerts_enabled
                                })}
                              >
                                {company.budget_alerts_enabled ? 'Disable' : 'Enable'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Current Budget</div>
                      <div className="font-medium flex items-center gap-1">
                        kr {company.current_budget?.toLocaleString('no-NO') || '0'}
                        {(company.current_budget || 0) <= (company.low_budget_threshold || 0) && (
                          <AlertCircle className="h-3 w-3 text-destructive" />
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Daily Budget</div>
                      <div className="font-medium">kr {company.daily_budget?.toLocaleString('no-NO') || '0'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Lead Cost</div>
                      <div className="font-medium">kr {company.lead_cost_per_unit?.toLocaleString('no-NO') || '0'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Auto-accept</div>
                      <div className="font-medium">
                        <Badge variant={company.auto_accept_leads ? 'default' : 'secondary'}>
                          {company.auto_accept_leads ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {company.tags && company.tags.length > 0 && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Service Categories</div>
                      <div className="flex gap-1 flex-wrap">
                        {company.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};