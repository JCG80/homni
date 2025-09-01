import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  Star,
  ArrowRight,
  Plus,
  Eye,
  MessageSquare,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { UserRole } from '@/types/auth';

interface DashboardProps {
  role: UserRole;
  user: any;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  variant: 'default' | 'secondary' | 'outline';
}

interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
}

export const RoleSpecificDashboard = ({ role, user }: DashboardProps) => {
  const getQuickActions = (): QuickAction[] => {
    switch (role) {
      case 'user':
        return [
          {
            id: 'new_request',
            title: 'Ny forespørsel',
            description: 'Få tilbud på en ny tjeneste',
            icon: Plus,
            href: '/',
            variant: 'default'
          },
          {
            id: 'view_offers',
            title: 'Se tilbud',
            description: 'Gjennomgå mottatte tilbud',
            icon: Eye,
            href: '/leads/my',
            variant: 'secondary'
          },
          {
            id: 'contact_support',
            title: 'Kundeservice',
            description: 'Trenger du hjelp?',
            icon: MessageSquare,
            href: '/support',
            variant: 'outline'
          }
        ];
      
      case 'company':
        return [
          {
            id: 'lead_pipeline',
            title: 'Lead-pipeline',
            description: 'Administrer dine leads',
            icon: TrendingUp,
            href: '/leads/pipeline',
            variant: 'default'
          },
          {
            id: 'subscription',
            title: 'Abonnement',
            description: 'Administrer pakker og budsjett',
            icon: Star,
            href: '/marketplace/packages',
            variant: 'secondary'
          },
          {
            id: 'performance',
            title: 'Ytelse',
            description: 'Se statistikk og rapporter',
            icon: TrendingUp,
            href: '/dashboard/analytics',
            variant: 'outline'
          }
        ];
      
      case 'admin':
      case 'master_admin':
        return [
          {
            id: 'lead_management',
            title: 'Lead-administrasjon',
            description: 'Administrer alle leads',
            icon: Users,
            href: '/leads/admin',
            variant: 'default'
          },
          {
            id: 'buyer_management',
            title: 'Kjøper-administrasjon',
            description: 'Administrer kjøpere og pakker',
            icon: Star,
            href: '/marketplace/admin',
            variant: 'secondary'
          },
          {
            id: 'system_health',
            title: 'Systemhelse',
            description: 'Overvåk system og ytelse',
            icon: TrendingUp,
            href: '/admin/system',
            variant: 'outline'
          }
        ];
      
      default:
        return [];
    }
  };

  const getMetrics = (): DashboardMetric[] => {
    switch (role) {
      case 'user':
        return [
          {
            id: 'active_requests',
            title: 'Aktive forespørsler',
            value: 3,
            change: '+1 denne uken',
            trend: 'up',
            icon: Mail
          },
          {
            id: 'received_offers',
            title: 'Mottatte tilbud',
            value: 12,
            change: '+4 siden i går',
            trend: 'up',
            icon: Eye
          },
          {
            id: 'potential_savings',
            title: 'Potensielle besparelser',
            value: '8 500 kr',
            change: 'Per år',
            trend: 'neutral',
            icon: TrendingUp
          }
        ];
      
      case 'company':
        return [
          {
            id: 'new_leads',
            title: 'Nye leads',
            value: 24,
            change: '+8 i dag',
            trend: 'up',
            icon: Users
          },
          {
            id: 'conversion_rate',
            title: 'Konverteringsrate',
            value: '68%',
            change: '+12% denne måneden',
            trend: 'up',
            icon: TrendingUp
          },
          {
            id: 'monthly_spend',
            title: 'Månedlig brukt',
            value: '12 400 kr',
            change: 'av 25 000 kr budsjett',
            trend: 'neutral',
            icon: Star
          }
        ];
      
      case 'admin':
      case 'master_admin':
        return [
          {
            id: 'total_leads',
            title: 'Totale leads',
            value: 1247,
            change: '+89 i dag',
            trend: 'up',
            icon: Users
          },
          {
            id: 'active_buyers',
            title: 'Aktive kjøpere',
            value: 156,
            change: '+12 denne måneden',
            trend: 'up',
            icon: Star
          },
          {
            id: 'platform_revenue',
            title: 'Platform-inntekt',
            value: '247 000 kr',
            change: '+23% vs forrige måned',
            trend: 'up',
            icon: TrendingUp
          }
        ];
      
      default:
        return [];
    }
  };

  const getWelcomeMessage = () => {
    const timeOfDay = new Date().getHours() < 12 ? 'God morgen' : 
                     new Date().getHours() < 18 ? 'God dag' : 'God kveld';
    
    switch (role) {
      case 'user':
        return {
          greeting: `${timeOfDay}, ${user?.user_metadata?.display_name || 'bruker'}!`,
          message: 'Her kan du administrere dine forespørsler og se tilbud fra leverandører.'
        };
      case 'company':
        return {
          greeting: `${timeOfDay}!`,
          message: 'Oversikt over dine leads og salgsmuligheter.'
        };
      case 'admin':
      case 'master_admin':
        return {
          greeting: `${timeOfDay}, admin!`,
          message: 'Administrer plattformen og overvåk systemytelse.'
        };
      default:
        return {
          greeting: `${timeOfDay}!`,
          message: 'Velkommen til Homni.'
        };
    }
  };

  const quickActions = getQuickActions();
  const metrics = getMetrics();
  const welcome = getWelcomeMessage();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-2">{welcome.greeting}</h1>
        <p className="text-muted-foreground text-lg">{welcome.message}</p>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Hurtighandlinger</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{action.title}</h3>
                <p className="text-muted-foreground mb-4">{action.description}</p>
                
                <Button asChild variant={action.variant} className="w-full">
                  <Link to={action.href}>
                    {action.title} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Key Metrics */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Oversikt</h2>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.id} className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  {metric.trend && (
                    <Badge 
                      variant={metric.trend === 'up' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                    </Badge>
                  )}
                </div>
                
                <h3 className="text-2xl font-bold mb-1">{metric.value}</h3>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                {metric.change && (
                  <p className="text-xs text-muted-foreground mt-1">{metric.change}</p>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Siste aktivitet</h2>
        <Card className="p-6">
          <div className="space-y-4">
            {role === 'user' && (
              <>
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Nytt tilbud mottatt</p>
                    <p className="text-sm text-muted-foreground">Varmepumpe - 3 tilbud tilgjengelige</p>
                  </div>
                  <Badge variant="secondary">2 timer siden</Badge>
                </div>
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Phone className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Leverandør tok kontakt</p>
                    <p className="text-sm text-muted-foreground">ElektroExpert AS - Strømavtale</p>
                  </div>
                  <Badge variant="secondary">I går</Badge>
                </div>
              </>
            )}

            {role === 'company' && (
              <>
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">3 nye leads tilgjengelige</p>
                    <p className="text-sm text-muted-foreground">Varmepumpe - Oslo område</p>
                  </div>
                  <Badge variant="default">Ny</Badge>
                </div>
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Star className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Lead konvertert til kunde</p>
                    <p className="text-sm text-muted-foreground">Familie Jensen - Varmepumpe installasjon</p>
                  </div>
                  <Badge variant="secondary">2 timer siden</Badge>
                </div>
              </>
            )}

            {(role === 'admin' || role === 'master_admin') && (
              <>
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">89 leads generert i dag</p>
                    <p className="text-sm text-muted-foreground">23% økning fra i går</p>
                  </div>
                  <Badge variant="default">Ny</Badge>
                </div>
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="p-2 bg-green-100 rounded-full">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Plattform-inntekt økt</p>
                    <p className="text-sm text-muted-foreground">23% økning denne måneden</p>
                  </div>
                  <Badge variant="secondary">I dag</Badge>
                </div>
              </>
            )}

            <div className="pt-4 text-center">
              <Button variant="outline">
                Se all aktivitet <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};