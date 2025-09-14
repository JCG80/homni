/**
 * Enhanced Admin Dashboard Component
 * Real-time system overview and controls
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingUp, Users, FileText, DollarSign, Clock, Target } from "lucide-react";
import { useAdminFullData } from "@/hooks/useLeadsData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { DashboardMetrics } from '@/types/metrics';
import { logger } from '@/utils/logger';

export const AdminDashboard: React.FC = () => {
  const { leads, companies, loading, refetch } = useAdminFullData();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [distributionRunning, setDistributionRunning] = useState(false);

  const calculateMetrics = (): DashboardMetrics => {
    const totalLeads = leads.length;
    const assignedLeads = leads.filter(lead => lead.company_id).length;
    const unassignedLeads = totalLeads - assignedLeads;
    const totalCompanies = companies.length;
    const activeCompanies = companies.filter(company => company.status === 'active').length;
    const totalBudget = companies.reduce((sum, company) => sum + (company.current_budget || 0), 0);
    const avgAssignmentCost = totalCompanies > 0 ? companies.reduce((sum, company) => sum + (company.lead_cost_per_unit || 500), 0) / totalCompanies : 0;
    const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const today = new Date().toISOString().split('T')[0];
    const todayLeads = leads.filter(lead => lead.created_at?.startsWith(today)).length;
    const distributionSuccessRate = totalLeads > 0 ? (assignedLeads / totalLeads) * 100 : 0;

    return {
      totalLeads,
      assignedLeads,
      unassignedLeads,
      totalCompanies,
      activeCompanies,
      totalBudget,
      avgAssignmentCost,
      conversionRate,
      todayLeads,
      distributionSuccessRate
    };
  };

  const runDistribution = async () => {
    setDistributionRunning(true);
    try {
      const { data: unassigned } = await supabase
        .from('leads')
        .select('id')
        .is('company_id', null);

      if (!unassigned?.length) {
        toast({
          title: "Info",
          description: "No unassigned leads to distribute"
        });
        return;
      }

      let successCount = 0;
      for (const lead of unassigned) {
        try {
          const { data } = await supabase.rpc('distribute_new_lead_v3', { 
            lead_id_param: lead.id 
          });
          if (data?.[0]?.success) successCount++;
        } catch (error) {
          logger.error('Distribution failed for lead:', { leadId: lead.id, error });
        }
      }

      toast({
        title: "Success",
        description: `Distributed ${successCount}/${unassigned.length} leads successfully`
      });
      await refetch();
    } catch (error) {
      logger.error('Error running distribution:', error);
      toast({
        title: "Error", 
        description: "Failed to run lead distribution",
        variant: "destructive"
      });
    } finally {
      setDistributionRunning(false);
    }
  };

  useEffect(() => {
    if (leads && companies) {
      setMetrics(calculateMetrics());
    }
  }, [leads, companies]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  if (loading || !metrics) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Systemoversikt og kontroll</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runDistribution} 
            disabled={distributionRunning}
            className="flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            {distributionRunning ? 'Distributing...' : 'Run Distribution'}
          </Button>
          <Button variant="outline" onClick={refetch}>
            <Clock className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.todayLeads} created today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.assignedLeads}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.distributionSuccessRate.toFixed(1)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.unassignedLeads}</div>
            <p className="text-xs text-muted-foreground">
              Pending distribution
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeCompanies}</div>
            <p className="text-xs text-muted-foreground">
              of {metrics.totalCompanies} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget Overview
            </CardTitle>
            <CardDescription>
              Total budget across all companies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Intl.NumberFormat('no-NO', { 
                style: 'currency', 
                currency: 'NOK' 
              }).format(metrics.totalBudget)}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Avg. cost per lead: {new Intl.NumberFormat('no-NO', { 
                style: 'currency', 
                currency: 'NOK' 
              }).format(metrics.avgAssignmentCost)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Current system health and performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Distribution Success Rate</span>
              <Badge variant={metrics.distributionSuccessRate > 80 ? "default" : "destructive"}>
                {metrics.distributionSuccessRate.toFixed(1)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Conversion Rate</span>
              <Badge variant={metrics.conversionRate > 10 ? "default" : "secondary"}>
                {metrics.conversionRate.toFixed(1)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Unassigned Leads</span>
              <Badge variant={metrics.unassignedLeads === 0 ? "default" : "destructive"}>
                {metrics.unassignedLeads}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
          <CardDescription>
            Latest leads in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{lead.title}</h4>
                  <p className="text-sm text-muted-foreground">{lead.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={lead.company_id ? "default" : "secondary"}>
                    {lead.company_id ? "Assigned" : "Unassigned"}
                  </Badge>
                  <Badge variant="outline">
                    {lead.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};