import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntegratedAuth } from '@/modules/auth/hooks/useIntegratedAuth';
import { useProperty } from '@/modules/property/hooks/useProperty';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Home, 
  MessageSquare, 
  Settings,
  HelpCircle,
  ArrowRight,
  Clock,
  CheckCircle,
  TrendingUp,
  Activity,
  Target,
  Lightbulb
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';
import { logger } from '@/utils/logger';

interface UserStats {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  hasProperties: boolean;
  isNewUser: boolean;
}

/**
 * Optimized User Dashboard - Clean, focused, and intuitive
 * Prioritizes property management and request workflow
 */
export const OptimizedUserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading } = useIntegratedAuth();
  const { properties, loading: propertiesLoading } = useProperty();
  
  const [userStats, setUserStats] = useState<UserStats>({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    hasProperties: false,
    isNewUser: false
  });
  
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !isLoading) {
      fetchUserData();
    }
  }, [user, isLoading, properties]);

  const fetchUserData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Fetch user requests/leads
      const { data: leads } = await supabase
        .from('leads')
        .select('id, title, status, created_at, category')
        .eq('submitted_by', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const totalRequests = leads?.length || 0;
      const pendingRequests = leads?.filter(lead => 
        ['new', 'qualified', 'contacted'].includes(lead.status)
      ).length || 0;
      const completedRequests = leads?.filter(lead => 
        lead.status === 'converted'
      ).length || 0;

      // Check if user is new (created within last 48 hours)
      const { data: authUser } = await supabase.auth.getUser();
      let isNewUser = false;
      if (authUser.user?.created_at) {
        const userCreatedAt = new Date(authUser.user.created_at);
        isNewUser = Date.now() - userCreatedAt.getTime() < 48 * 60 * 60 * 1000;
      }

      setUserStats({
        totalRequests,
        pendingRequests,
        completedRequests,
        hasProperties: properties && properties.length > 0,
        isNewUser
      });

      setRecentRequests(leads || []);
      
    } catch (error) {
      logger.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
      case 'qualified':
        return { 
          label: 'Ny', 
          variant: 'default' as const,
          icon: <Clock className="w-3 h-3" />
        };
      case 'contacted':
        return { 
          label: 'Kontaktet', 
          variant: 'secondary' as const,
          icon: <TrendingUp className="w-3 h-3" />
        };
      case 'converted':
        return { 
          label: 'Fullført', 
          variant: 'default' as const,
          icon: <CheckCircle className="w-3 h-3" />
        };
      default:
        return { 
          label: status, 
          variant: 'outline' as const,
          icon: <Activity className="w-3 h-3" />
        };
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = profile?.full_name || user?.email?.split('@')[0] || 'Bruker';
    
    if (userStats.isNewUser) {
      return `Velkommen til Homni, ${name}!`;
    }
    
    if (hour < 12) return `God morgen, ${name}`;
    if (hour < 18) return `God dag, ${name}`;
    return `God kveld, ${name}`;
  };

  const getPrimaryActions = () => {
    const actions = [];
    
    // Always show new request as primary action
    actions.push({
      title: userStats.totalRequests === 0 ? 'Send første forespørsel' : 'Ny forespørsel',
      description: 'Få tilbud fra kvalifiserte tjenesteyterne',
      icon: Plus,
      onClick: () => navigate('/'),
      variant: 'default' as const,
      primary: true
    });

    // Properties action based on status
    if (!userStats.hasProperties) {
      actions.push({
        title: 'Registrer eiendom',
        description: 'Legg til din første eiendom',
        icon: Home,
        onClick: () => navigate('/properties/new'),
        variant: 'outline' as const,
        badge: 'Anbefalt'
      });
    } else {
      actions.push({
        title: 'Mine eiendommer',
        description: `${properties?.length || 0} ${properties?.length === 1 ? 'eiendom' : 'eiendommer'}`,
        icon: Home,
        onClick: () => navigate('/properties'),
        variant: 'outline' as const
      });
    }

    // Requests action if user has any
    if (userStats.totalRequests > 0) {
      actions.push({
        title: 'Mine forespørsler',
        description: `${userStats.totalRequests} forespørsler totalt`,
        icon: MessageSquare,
        onClick: () => navigate('/leads'),
        variant: 'ghost' as const,
        badge: userStats.pendingRequests > 0 ? `${userStats.pendingRequests} nye` : undefined
      });
    }

    return actions;
  };

  const getNextSteps = () => {
    if (userStats.isNewUser || userStats.totalRequests === 0) {
      return [
        {
          title: 'Send din første forespørsel',
          description: 'Start med å be om tilbud',
          action: () => navigate('/'),
          completed: false,
          primary: true
        },
        {
          title: 'Registrer din eiendom',
          description: 'Få mer presise tilbud',
          action: () => navigate('/properties/new'),
          completed: userStats.hasProperties,
          primary: !userStats.hasProperties
        }
      ];
    }

    return [
      {
        title: 'Følg opp ventende forespørsler',
        description: `${userStats.pendingRequests} forespørsler venter`,
        action: () => navigate('/leads'),
        completed: userStats.pendingRequests === 0,
        primary: userStats.pendingRequests > 0,
        show: userStats.pendingRequests > 0
      },
      {
        title: 'Legg til flere eiendommer',
        description: 'Administrer alle dine eiendommer',
        action: () => navigate('/properties'),
        completed: userStats.hasProperties && (properties?.length || 0) > 1,
        primary: false
      }
    ].filter(step => step.show !== false);
  };

  if (isLoading || loading) {
    return (
      <div className="animate-pulse space-y-6 max-w-7xl mx-auto p-6">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const primaryActions = getPrimaryActions();
  const nextSteps = getNextSteps();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{getGreeting()}</h1>
          <p className="text-muted-foreground mt-1">
            {userStats.isNewUser 
              ? 'La oss hjelpe deg komme i gang med Homni.'
              : 'Her er din oversikt over eiendommer og forespørsler.'
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
            <Settings className="w-4 h-4 mr-2" />
            Innstillinger
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/help')}>
            <HelpCircle className="w-4 h-4 mr-2" />
            Hjelp
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Primary Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Hurtighandlinger</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {primaryActions.map((action) => (
                <Button
                  key={action.title}
                  variant={action.variant}
                  size="lg"
                  className={`h-auto p-4 justify-start ${
                    action.primary ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''
                  }`}
                  onClick={action.onClick}
                >
                  <div className="flex items-center gap-3 w-full">
                    <action.icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{action.title}</span>
                        <div className="flex items-center gap-2">
                          {action.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {action.badge}
                            </Badge>
                          )}
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-sm opacity-80 mt-1">
                        {action.description}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Statistics */}
          {userStats.totalRequests > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{userStats.totalRequests}</div>
                  <div className="text-sm text-muted-foreground">Forespørsler</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{userStats.pendingRequests}</div>
                  <div className="text-sm text-muted-foreground">Venter svar</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{userStats.completedRequests}</div>
                  <div className="text-sm text-muted-foreground">Fullført</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Siste aktivitet
                </CardTitle>
                {recentRequests.length > 0 && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => navigate('/leads')}
                  >
                    Se alle <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {recentRequests.length > 0 ? (
                <div className="space-y-3">
                  {recentRequests.slice(0, 3).map((request) => {
                    const statusInfo = getStatusDisplay(request.status);
                    return (
                      <div 
                        key={request.id} 
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/leads/${request.id}`)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{request.title}</span>
                            <Badge variant={statusInfo.variant} className="flex items-center gap-1 text-xs">
                              {statusInfo.icon}
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(request.created_at), { 
                              addSuffix: true, 
                              locale: nb 
                            })}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Ingen aktivitet ennå</h3>
                  <p className="text-muted-foreground mb-4">
                    Start ved å sende din første forespørsel
                  </p>
                  <Button onClick={() => navigate('/')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Send forespørsel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          
          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Neste steg
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {nextSteps.map((step, index) => (
                <div key={index}>
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      step.completed 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                        : step.primary
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {step.completed ? '✓' : index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{step.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                    </div>
                  </div>
                  {!step.completed && (
                    <Button 
                      size="sm" 
                      variant={step.primary ? "default" : "outline"}
                      className="w-full ml-9"
                      onClick={step.action}
                    >
                      {step.primary ? 'Start nå' : 'Se mer'}
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Properties Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-green-500" />
                  Mine eiendommer
                </CardTitle>
                {properties && properties.length > 0 && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => navigate('/properties')}
                  >
                    Se alle
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {propertiesLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ) : properties && properties.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{properties.length}</div>
                    <div className="text-sm text-muted-foreground">
                      {properties.length === 1 ? 'Eiendom' : 'Eiendommer'}
                    </div>
                  </div>
                  {properties.slice(0, 2).map((property) => (
                    <div key={property.id} className="text-sm">
                      <div className="font-medium">{property.name}</div>
                      <div className="text-muted-foreground">
                        {property.address || 'Adresse ikke angitt'}
                      </div>
                    </div>
                  ))}
                  {properties.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{properties.length - 2} flere
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Home className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Ingen eiendommer registrert
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => navigate('/properties/new')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Legg til
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {userStats.isNewUser ? (
                  <>
                    <div>
                      <div className="font-medium">Velkommen!</div>
                      <div className="text-muted-foreground text-xs">
                        Start med å sende en forespørsel for å teste tjenesten
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Registrer eiendom</div>
                      <div className="text-muted-foreground text-xs">
                        Få mer presise og relevante tilbud
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {!userStats.hasProperties && (
                      <div>
                        <div className="font-medium">Legg til eiendommer</div>
                        <div className="text-muted-foreground text-xs">
                          Registrer dine eiendommer for bedre tilbud
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="font-medium">Fullfør profilen</div>
                      <div className="text-muted-foreground text-xs">
                        Komplett informasjon gir bedre resultater
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};