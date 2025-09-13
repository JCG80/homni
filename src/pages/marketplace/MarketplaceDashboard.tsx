import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/modules/auth/hooks';
import { Link } from 'react-router-dom';
import { Package, Users, Activity, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/hooks/useI18n';

export const MarketplaceDashboard: React.FC = () => {
  const { role } = useAuth();
  const { t } = useI18n();
  
  // Fetch marketplace stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['marketplace-stats'],
    queryFn: async () => {
      const [packages, buyers, assignments] = await Promise.all([
        supabase.from('lead_packages').select('*', { count: 'exact' }),
        supabase.from('buyer_accounts').select('*', { count: 'exact' }),
        supabase.from('lead_assignments').select('*', { count: 'exact' })
      ]);
      
      return {
        totalPackages: packages.count || 0,
        totalBuyers: buyers.count || 0,
        totalAssignments: assignments.count || 0,
        activePackages: packages.data?.filter(p => p.is_active).length || 0
      };
    }
  });

  const isAdmin = role === 'admin' || role === 'master_admin';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
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
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">
            Manage lead packages, buyers, and distribution
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/marketplace/packages">
                <Package className="w-4 h-4 mr-2" />
                Manage Packages
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/marketplace/buyers">
                <Users className="w-4 h-4 mr-2" />
                Manage Buyers
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPackages || 0}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {stats?.activePackages || 0} active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Buyers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBuyers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Companies buying leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lead Assignments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAssignments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total leads distributed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹0</div>
            <p className="text-xs text-muted-foreground">
              Coming soon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
              <CardDescription>
                Manage packages, buyers, and marketplace settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link to="/marketplace/packages">
                  <Package className="w-4 h-4 mr-2" />
                  Create New Package
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <Link to="/marketplace/buyers">
                  <Users className="w-4 h-4 mr-2" />
                  View All Buyers
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Lead Pipeline</CardTitle>
            <CardDescription>
              Manage your assigned leads through the sales pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/marketplace/pipeline">
                <Activity className="w-4 h-4 mr-2" />
                View Pipeline
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};