import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Home, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  ArrowRight,
  Plus,
  Activity,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';

interface UserStats {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  hasProperties: boolean;
  isNewUser: boolean;
}

interface Property {
  id: string;
  name: string;
  address?: string;
  type?: string;
  size?: number;
}

interface PrimaryContentAreaProps {
  userStats: UserStats;
  properties?: Property[];
  propertiesLoading: boolean;
  onRefresh: () => void;
}

interface RecentRequest {
  id: string;
  title: string;
  status: string;
  created_at: string;
  category?: string;
}

/**
 * Main content area with prioritized information display
 */
export const PrimaryContentArea: React.FC<PrimaryContentAreaProps> = ({ 
  userStats, 
  properties = [],
  propertiesLoading,
  onRefresh 
}) => {
  const navigate = useNavigate();
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentRequests();
  }, []);

  const fetchRecentRequests = async () => {
    try {
      const { data: leads } = await supabase
        .from('leads')
        .select('id, title, status, created_at, category')
        .order('created_at', { ascending: false })
        .limit(3);

      setRecentRequests(leads || []);
    } catch (error) {
      console.error('Error fetching recent requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
      case 'qualified':
        return { 
          label: 'Ny', 
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
          icon: <Clock className="w-3 h-3" />
        };
      case 'contacted':
        return { 
          label: 'Kontaktet', 
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
          icon: <TrendingUp className="w-3 h-3" />
        };
      case 'converted':
        return { 
          label: 'Fullført', 
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
          icon: <CheckCircle className="w-3 h-3" />
        };
      default:
        return { 
          label: status, 
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
          icon: <Activity className="w-3 h-3" />
        };
    }
  };

  const renderEmptyState = () => {
    if (userStats.isNewUser || userStats.totalRequests === 0) {
      return (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ingen forespørsler ennå</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start din Homni-reise ved å sende din første forespørsel. Vi kobler deg med kvalifiserte tjenesteyterne.
            </p>
            <Button onClick={() => navigate('/')}>
              <Plus className="w-4 h-4 mr-2" />
              Send første forespørsel
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="text-center py-8">
        <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">Ingen nylig aktivitet</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Key Metrics Row */}
      {userStats.totalRequests > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{userStats.totalRequests}</div>
              <div className="text-sm text-muted-foreground">Totale forespørsler</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{userStats.pendingRequests}</div>
              <div className="text-sm text-muted-foreground">Venter på svar</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{userStats.completedRequests}</div>
              <div className="text-sm text-muted-foreground">Fullførte</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Mine forespørsler
            </CardTitle>
            {recentRequests.length > 0 && (
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => navigate('/leads')}
                className="flex items-center gap-1"
              >
                Se alle
                <ArrowRight className="w-3 h-3" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recentRequests.length > 0 ? (
            <div className="space-y-4">
              {recentRequests.map((request) => {
                const statusInfo = getStatusInfo(request.status);
                return (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{request.title}</h4>
                        <Badge className={`${statusInfo.color} flex items-center gap-1 text-xs`}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(request.created_at), { 
                          addSuffix: true, 
                          locale: nb 
                        })}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => navigate(`/leads/${request.id}`)}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : renderEmptyState()}
        </CardContent>
      </Card>

      {/* Properties Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Mine eiendommer
            </CardTitle>
            {properties.length > 0 && (
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => navigate('/properties')}
                className="flex items-center gap-1"
              >
                Se alle
                <ArrowRight className="w-3 h-3" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {propertiesLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ) : properties.length > 0 ? (
            <div className="space-y-3">
              {properties.slice(0, 2).map((property) => (
                <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{property.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {property.address || 'Adresse ikke angitt'}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate(`/properties/${property.id}`)}
                  >
                    Se detaljer
                  </Button>
                </div>
              ))}
              {properties.length > 2 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  +{properties.length - 2} flere eiendommer
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-6 border-2 border-dashed border-muted rounded-lg">
              <Home className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground mb-3">Ingen eiendommer registrert</p>
              <Button 
                size="sm" 
                onClick={() => navigate('/properties')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Legg til eiendom
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};