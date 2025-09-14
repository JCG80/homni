import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { useProperties } from '@/modules/property/hooks/useProperties';
import { 
  Plus, 
  MessageSquare, 
  Home, 
  FileText, 
  Settings, 
  Search,
  Calendar,
  TrendingUp,
  AlertCircle,
  Clock,
  Wrench,
  DollarSign
} from 'lucide-react';

export const SmartQuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { properties } = useProperties();

  // Smart recommendations based on user state
  const getSmartActions = () => {
    const hasProperties = properties && properties.length > 0;
    const isNewUser = properties && properties.length === 0;
    
    // Priority actions for new users
    if (isNewUser) {
      return [
        {
          icon: Plus,
          label: 'Legg til første eiendom',
          description: 'Start med å registrere din første eiendom',
          action: () => navigate('/properties/new'),
          priority: 'high',
          category: 'setup'
        },
        {
          icon: FileText,
          label: 'Les veileder',
          description: 'Lær hvordan du bruker systemet',
          action: () => navigate('/docs/getting-started'),
          priority: 'medium',
          category: 'learn'
        },
        {
          icon: MessageSquare,
          label: 'Send første forespørsel',
          description: 'Be om tilbud på tjenester',
          action: () => navigate('/leads/new'),
          priority: 'medium',
          category: 'action'
        },
        {
          icon: Settings,
          label: 'Fullføre profil',
          description: 'Legg til kontaktinformasjon',
          action: () => navigate('/profile'),
          priority: 'low',
          category: 'setup'
        }
      ];
    }
    
    // Actions for experienced users
    return [
      {
        icon: Calendar,
        label: 'Vedlikeholdskalender',
        description: `${properties?.length || 0} eiendommer å følge opp`,
        action: () => navigate('/maintenance/calendar'),
        priority: 'high',
        category: 'maintenance',
        badge: 'Nye oppgaver'
      },
      {
        icon: Plus,
        label: 'Ny eiendom',
        description: 'Utvid porteføljen din',
        action: () => navigate('/properties/new'),
        priority: 'medium',
        category: 'growth'
      },
      {
        icon: TrendingUp,
        label: 'Eiendomsanalyse',
        description: 'Se verdivurdering og trends',
        action: () => navigate('/analytics/properties'),
        priority: 'medium',
        category: 'insights'
      },
      {
        icon: MessageSquare,
        label: 'Send forespørsel',
        description: 'Be om tilbud på tjenester',
        action: () => navigate('/leads/new'),
        priority: 'medium',
        category: 'action'
      },
      {
        icon: Search,
        label: 'Finn leverandører',
        description: 'Søk etter tjenesteleverandører',
        action: () => navigate('/search'),
        priority: 'low',
        category: 'discovery'
      },
      {
        icon: FileText,
        label: 'Dokumenter',
        description: 'Organiser eiendomsdokumenter',
        action: () => navigate('/documents'),
        priority: 'low',
        category: 'organization'
      }
    ];
  };

  const getUrgentActions = () => {
    // Simulate urgent actions based on property data
    if (!properties || properties.length === 0) return [];
    
    return [
      {
        icon: AlertCircle,
        label: 'Påkrevd vedlikehold',
        description: '2 oppgaver forfaller snart',
        action: () => navigate('/maintenance?filter=urgent'),
        urgent: true
      },
      {
        icon: DollarSign,
        label: 'Budsjettvarsel',
        description: 'Månedlig budsjett nærmer seg grensen',
        action: () => navigate('/budget'),
        urgent: true
      }
    ];
  };

  const smartActions = getSmartActions();
  const urgentActions = getUrgentActions();
  const primaryActions = smartActions.filter(action => action.priority === 'high');
  const secondaryActions = smartActions.filter(action => action.priority !== 'high');

  return (
    <div className="space-y-4">
      {/* Urgent Actions */}
      {urgentActions.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-4 w-4" />
              Krever oppmerksomhet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {urgentActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={action.action}
                className="w-full justify-start h-auto p-3 border-orange-200 hover:border-orange-300"
              >
                <action.icon className="h-4 w-4 mr-3 text-orange-600" />
                <div className="text-left flex-1">
                  <div className="font-medium text-sm text-orange-800">{action.label}</div>
                  <div className="text-xs text-orange-600">{action.description}</div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Primary Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Hurtighandlinger</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {primaryActions.map((action, index) => (
              <Button
                key={index}
                variant="default"
                onClick={action.action}
                className="h-auto flex flex-col items-start gap-2 p-4 relative"
              >
                {action.badge && (
                  <Badge className="absolute -top-1 -right-1 text-xs bg-red-500 text-white">
                    {action.badge}
                  </Badge>
                )}
                <div className="flex items-center gap-2 w-full">
                  <action.icon className="h-5 w-5" />
                  <span className="font-medium text-sm">{action.label}</span>
                </div>
                <div className="text-xs opacity-90 text-left w-full">
                  {action.description}
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Secondary Actions */}
      {secondaryActions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Mer å utforske</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {secondaryActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={action.action}
                  className="h-auto flex flex-col items-center gap-2 p-3"
                >
                  <action.icon className="h-4 w-4" />
                  <div className="text-center">
                    <div className="font-medium text-xs">{action.label}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personalized Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-blue-900 mb-1">
                {properties && properties.length > 0 
                  ? 'Optimaliser eiendomsforvaltningen' 
                  : 'Velkommen til Homni!'}
              </h3>
              <p className="text-xs text-blue-700">
                {properties && properties.length > 0 
                  ? 'Sett opp automatiske vedlikeholdspåminnelser for å spare tid og penger.'
                  : 'Start med å legge til din første eiendom for å få tilgang til alle funksjoner.'}
              </p>
              <Button 
                variant="link" 
                size="sm" 
                className="h-auto p-0 text-blue-600 font-medium"
                onClick={() => navigate(properties && properties.length > 0 ? '/maintenance/setup' : '/properties/new')}
              >
                {properties && properties.length > 0 ? 'Sett opp nå' : 'Kom i gang'} →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};