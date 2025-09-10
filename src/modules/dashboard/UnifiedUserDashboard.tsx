import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/modules/auth/hooks';
import { supabase } from '@/integrations/supabase/client';
import { LeadsOffersDashboard } from '@/components/dashboard/LeadsOffersDashboard';
import { PostAuthOnboardingWizard } from '@/components/onboarding/PostAuthOnboardingWizard';
import { NextRecommendedActionWidget } from '@/components/dashboard/NextRecommendedActionWidget';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Plus, 
  ArrowRight,
  Mail,
  Calendar,
  Activity,
  Home,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

interface Lead {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  metadata: any;
  attributed_at?: string;
}

interface DashboardStats {
  totalLeads: number;
  pendingLeads: number;
  contactedLeads: number;
  recentActivity: number;
}

export function UnifiedUserDashboard() {
  const { user, profile } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    pendingLeads: 0,
    contactedLeads: 0,
    recentActivity: 0
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user needs onboarding (new user or recently attributed leads)
    checkOnboardingStatus();
    
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    try {
      // Check if user has attributed leads (recently linked)
      const { data: attributedLeads } = await supabase
        .from('leads')
        .select('id, attributed_at')
        .eq('submitted_by', user.id)
        .not('attributed_at', 'is', null)
        .gte('attributed_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Last 5 minutes

      // Check if user is newly created (within last hour)
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user?.created_at) {
        const userCreatedAt = new Date(authUser.user.created_at);
        const isNewUser = Date.now() - userCreatedAt.getTime() < 60 * 60 * 1000;
        
        if (isNewUser && (!profile?.metadata || Object.keys(profile.metadata).length === 0)) {
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch user leads with stats
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .or(`submitted_by.eq.${user!.id},and(anonymous_email.eq.${user!.email},submitted_by.is.null)`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalLeads = leads?.length || 0;
      const pendingLeads = leads?.filter(lead => 
        lead.status === 'new' || lead.status === 'qualified'
      ).length || 0;
      const contactedLeads = leads?.filter(lead => 
        lead.status === 'contacted' || lead.status === 'negotiating' || lead.status === 'converted'
      ).length || 0;
      
      // Recent activity (leads created in last 7 days)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentActivity = leads?.filter(lead => new Date(lead.created_at) > weekAgo).length || 0;

      setStats({
        totalLeads,
        pendingLeads,
        contactedLeads,
        recentActivity
      });

      // Set recent leads (max 3)
      setRecentLeads(leads?.slice(0, 3) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Refresh dashboard data
    fetchDashboardData();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
      case 'qualified':
        return 'bg-yellow-100 text-yellow-800';
      case 'contacted':
      case 'negotiating':
        return 'bg-blue-100 text-blue-800';
      case 'converted':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
      case 'qualified':
        return <Clock className="w-4 h-4" />;
      case 'contacted':
      case 'negotiating':
        return <TrendingUp className="w-4 h-4" />;
      case 'converted':
        return <CheckCircle className="w-4 h-4" />;
      case 'lost':
        return <Mail className="w-4 h-4" />;
      case 'paused':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (showOnboarding) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-lg text-muted-foreground mb-2">Velkommen til Homni!</p>
          <p className="text-muted-foreground">
            La oss sette opp din konto og koble eventuelle tidligere forespørsler
          </p>
        </div>
        <PostAuthOnboardingWizard onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg text-muted-foreground">
            Velkommen tilbake, {profile?.full_name || user?.email?.split('@')[0]}!
          </p>
          <p className="text-muted-foreground">
            Her er en oversikt over dine forespørsler og aktivitet
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ny forespørsel
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Totale forespørsler</p>
                <p className="text-2xl font-bold">{stats.totalLeads}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Venter på svar</p>
                <p className="text-2xl font-bold">{stats.pendingLeads}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kontaktet</p>
                <p className="text-2xl font-bold">{stats.contactedLeads}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Siste uke</p>
                <p className="text-2xl font-bold">{stats.recentActivity}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Recommended Action Widget */}
        <div className="lg:col-span-1">
          <NextRecommendedActionWidget />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Nylig aktivitet
                </span>
                {recentLeads.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = '/leads'}>
                    Se alle
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentLeads.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Ingen forespørsler ennå</p>
                  <Button className="mt-4" onClick={() => window.location.href = '/'}>
                    Send din første forespørsel
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium truncate">{lead.title}</h4>
                          <Badge className={`${getStatusColor(lead.status)} flex items-center gap-1 text-xs`}>
                            {getStatusIcon(lead.status)}
                            {lead.status === 'new' ? 'Ny' :
                             lead.status === 'qualified' ? 'Kvalifisert' : 
                             lead.status === 'contacted' ? 'Kontaktet' : 
                             lead.status === 'negotiating' ? 'Forhandler' :
                             lead.status === 'converted' ? 'Fullført' : 
                             lead.status === 'lost' ? 'Tapt' :
                             lead.status === 'paused' ? 'Pauset' : lead.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(lead.created_at), 'dd. MMM yyyy', { locale: nb })}
                          {lead.attributed_at && (
                            <span className="ml-2 text-blue-600">• Koblet til konto</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Property Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Min eiendom
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between">
              <span className="text-sm">Adresse</span>
              <span className="text-sm font-medium">Ikke registrert</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Type</span>
              <span className="text-sm font-medium">-</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Størrelse</span>
              <span className="text-sm font-medium">-</span>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Registrer eiendom
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Full Leads Dashboard */}
      {stats.totalLeads > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Alle dine forespørsler</h2>
          <LeadsOffersDashboard />
        </div>
      )}
    </div>
  );
}