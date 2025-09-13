import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Activity,
  Home,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StatsWidgetProps {
  stats: {
    totalRequests: number;
    pendingRequests: number;
    completedRequests: number;
    hasProperties: boolean;
  };
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({ stats }) => {
  const navigate = useNavigate();

  const statItems = [
    {
      label: 'Forespørsler',
      value: stats.totalRequests,
      icon: MessageSquare,
      description: 'Totalt sendt',
      onClick: () => navigate('/leads')
    },
    {
      label: 'Venter svar',
      value: stats.pendingRequests,
      icon: Clock,
      description: 'Pågående',
      color: 'text-orange-600',
      onClick: () => navigate('/leads?status=pending')
    },
    {
      label: 'Fullført',
      value: stats.completedRequests,
      icon: CheckCircle,
      description: 'Avsluttet',
      color: 'text-green-600',
      onClick: () => navigate('/leads?status=completed')
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {statItems.map((item) => (
        <Card 
          key={item.label}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={item.onClick}
        >
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <item.icon className={`w-5 h-5 ${item.color || 'text-primary'}`} />
            </div>
            <div className={`text-2xl font-bold ${item.color || ''}`}>
              {item.value}
            </div>
            <div className="text-sm text-muted-foreground">{item.description}</div>
            <div className="text-xs font-medium mt-1">{item.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

interface QuickMetricsProps {
  metrics: {
    responseTime: string;
    satisfactionRate: string;
    activeProjects: number;
    weeklyActivity: number;
  };
}

export const QuickMetrics: React.FC<QuickMetricsProps> = ({ metrics }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Aktivitet denne uken
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Nye forespørsler</span>
          <Badge variant="outline">{metrics.weeklyActivity}</Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Aktive prosjekter</span>
          <Badge variant="outline">{metrics.activeProjects}</Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Gjennomsnittlig responstid</span>
          <Badge variant="secondary">{metrics.responseTime}</Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Tilfredshet</span>
          <Badge variant="default" className="bg-green-100 text-green-700">
            {metrics.satisfactionRate}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

interface PropertySummaryProps {
  properties: any[];
  loading: boolean;
}

export const PropertySummary: React.FC<PropertySummaryProps> = ({ 
  properties, 
  loading 
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5 text-green-500" />
            Eiendommer ({properties.length})
          </CardTitle>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => navigate('/properties')}
          >
            Administrer <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {properties.length > 0 ? (
          <div className="space-y-2">
            {properties.slice(0, 2).map((property) => (
              <div key={property.id} className="text-sm">
                <div className="font-medium">{property.name}</div>
                <div className="text-muted-foreground text-xs">
                  {property.address || 'Adresse ikke angitt'}
                </div>
              </div>
            ))}
            {properties.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{properties.length - 2} flere eiendommer
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
              Legg til eiendom
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};