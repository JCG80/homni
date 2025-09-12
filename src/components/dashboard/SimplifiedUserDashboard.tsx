import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface DashboardStats {
  totalLeads: number;
  pendingLeads: number;
  completedLeads: number;
  conversionRate: number;
}

export const SimplifiedUserDashboard: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    pendingLeads: 0,
    completedLeads: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug info removed for cleaner console

  useEffect(() => {
    if (!authLoading) {
      if (user?.id) {
        // User ready, fetching data
        fetchDashboardData();
      } else {
        // No user found
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    if (!user?.id) {
      // No user ID, skipping data fetch
      setLoading(false);
      return;
    }

    try {
      // Fetching dashboard data for user
      
      const userEmail = user.email || '';
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .or(`submitted_by.eq.${user.id},and(anonymous_email.eq.${userEmail},submitted_by.is.null)`)
        .order('created_at', { ascending: false });

      if (error) {
        // Database error occurred
        throw error;
      }

      const totalLeads = leads?.length || 0;
      const pendingLeads = leads?.filter(lead => 
        lead.status === 'new' || lead.status === 'contacted' || lead.status === 'qualified'
      ).length || 0;
      const completedLeads = leads?.filter(lead => 
        lead.status === 'converted'
      ).length || 0;
      
      const conversionRate = totalLeads > 0 ? (completedLeads / totalLeads) * 100 : 0;

      setStats({
        totalLeads,
        pendingLeads,
        completedLeads,
        conversionRate,
      });

      // Dashboard data loaded successfully
    } catch (error) {
      // Error fetching dashboard data
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Show loading if auth or data is still loading
  if (authLoading || loading) {
    // Showing loading state
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laster dashboard...</p>
          <p className="text-xs text-muted-foreground/70 mt-2">
            Henter dine siste forespørsler
          </p>
        </div>
      </div>
    );
  }

  // Enhanced error state with recovery options
  if (error) {
    return (
      <div className="p-6 text-center space-y-4">
        <h2 className="text-xl font-semibold">Kunne ikke laste dashboard</h2>
        <p className="text-muted-foreground">{error}</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => {
            setError(null);
            setLoading(true);
            fetchDashboardData();
          }} variant="outline">
            Prøv igjen
          </Button>
          <Button onClick={() => window.location.reload()} variant="ghost" size="sm">
            Oppdater siden
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Hvis problemet vedvarer, kontakt support på support@homni.no
        </p>
      </div>
    );
  }

  // If no user after loading is complete, show message
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Ingen brukerinformasjon tilgjengelig</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Velkommen tilbake!</h1>
        <p className="text-muted-foreground mt-2">
          Her er en oversikt over dine leads og aktivitet.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              Alle dine leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventende</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingLeads}</div>
            <p className="text-xs text-muted-foreground">
              Under behandling
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fullført</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedLeads}</div>
            <p className="text-xs text-muted-foreground">
              Avsluttede leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Konverteringsrate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Av alle leads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hurtighandlinger</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button>
              Opprett ny lead
            </Button>
            <Button variant="outline">
              Se alle leads
            </Button>
            <Button variant="outline">
              Statistikk
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};