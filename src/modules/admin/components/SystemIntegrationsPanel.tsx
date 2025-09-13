import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plug, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  ExternalLink,
  Key,
  Database,
  CreditCard,
  Mail,
  Bell,
  Map,
  Building
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  category: 'payment' | 'data' | 'communication' | 'analytics' | 'utility';
  icon: React.ReactNode;
  enabled: boolean;
  requiresApiKey: boolean;
  hasApiKey: boolean;
  lastSync?: string;
  errorMessage?: string;
}

// Mock integrations data - in production this would come from the database
const integrations: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Betalingsbehandling for premiumtjenester',
    status: 'disconnected',
    category: 'payment',
    icon: <CreditCard className="h-5 w-5" />,
    enabled: false,
    requiresApiKey: true,
    hasApiKey: false
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Database og autentisering',
    status: 'connected',
    category: 'data',
    icon: <Database className="h-5 w-5" />,
    enabled: true,
    requiresApiKey: true,
    hasApiKey: true,
    lastSync: '2024-01-15T10:30:00Z'
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'E-post leveranse og notifikasjoner',
    status: 'disconnected',
    category: 'communication',
    icon: <Mail className="h-5 w-5" />,
    enabled: false,
    requiresApiKey: true,
    hasApiKey: false
  },
  {
    id: 'finn-api',
    name: 'Finn.no API',
    description: 'Eiendomsdata og markedsinformasjon',
    status: 'pending',
    category: 'data',
    icon: <Building className="h-5 w-5" />,
    enabled: false,
    requiresApiKey: true,
    hasApiKey: false
  },
  {
    id: 'google-maps',
    name: 'Google Maps',
    description: 'Kartdata og geolokalisering',
    status: 'disconnected',
    category: 'utility',
    icon: <Map className="h-5 w-5" />,
    enabled: false,
    requiresApiKey: true,
    hasApiKey: false
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team notifikasjoner og varsler',
    status: 'error',
    category: 'communication',
    icon: <Bell className="h-5 w-5" />,
    enabled: false,
    requiresApiKey: true,
    hasApiKey: false,
    errorMessage: 'Ugyldig webhook URL'
  }
];

export const SystemIntegrationsPanel: React.FC = () => {
  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Plug className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return 'default';
      case 'error':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getCategoryLabel = (category: Integration['category']) => {
    switch (category) {
      case 'payment':
        return 'Betaling';
      case 'data':
        return 'Data';
      case 'communication':
        return 'Kommunikasjon';
      case 'analytics':
        return 'Analyse';
      case 'utility':
        return 'Verktøy';
      default:
        return 'Annet';
    }
  };

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const totalCount = integrations.length;
  const errorCount = integrations.filter(i => i.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Integrasjoner</h2>
          <p className="text-muted-foreground">
            Administrer eksterne tjenester og API-tilkoblinger
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            {connectedCount}/{totalCount} tilkoblet
          </Badge>
          {errorCount > 0 && (
            <Badge variant="destructive">
              {errorCount} feil
            </Badge>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aktive</p>
                <p className="text-2xl font-bold text-green-600">{connectedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Venter</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {integrations.filter(i => i.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Feil</p>
                <p className="text-2xl font-bold text-red-600">{errorCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Totalt</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
              <Plug className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Integrations Alert */}
      {errorCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {errorCount} integrasjon{errorCount > 1 ? 'er' : ''} har feil og krever oppmerksomhet.
          </AlertDescription>
        </Alert>
      )}

      {/* API Keys Needed Alert */}
      {integrations.some(i => i.requiresApiKey && !i.hasApiKey) && (
        <Alert>
          <Key className="h-4 w-4" />
          <AlertDescription>
            Flere integrasjoner krever API-nøkler for å aktiveres. 
            Kontakt systemadministrator for å konfigurere disse.
          </AlertDescription>
        </Alert>
      )}

      {/* Integrations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {integration.icon}
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {integration.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(integration.status)}>
                    {getStatusIcon(integration.status)}
                    <span className="ml-1 capitalize">{integration.status}</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {getCategoryLabel(integration.category)}
                  </Badge>
                  {integration.requiresApiKey && (
                    <Badge variant={integration.hasApiKey ? 'default' : 'secondary'} className="text-xs">
                      <Key className="h-3 w-3 mr-1" />
                      API Key {integration.hasApiKey ? 'OK' : 'Mangler'}
                    </Badge>
                  )}
                </div>
                <Switch 
                  checked={integration.enabled && integration.status === 'connected'} 
                  disabled={!integration.hasApiKey || integration.status === 'error'}
                />
              </div>

              {integration.errorMessage && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {integration.errorMessage}
                  </AlertDescription>
                </Alert>
              )}

              {integration.lastSync && (
                <p className="text-xs text-muted-foreground">
                  Siste synkronisering: {new Date(integration.lastSync).toLocaleString('no-NO')}
                </p>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={integration.status === 'connected'}
                >
                  {integration.status === 'connected' ? 'Tilkoblet' : 'Konfigurer'}
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Detaljer
                </Button>
                {integration.status === 'error' && (
                  <Button variant="outline" size="sm">
                    Prøv igjen
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Categories Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Integrasjonskategorier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['payment', 'data', 'communication', 'analytics', 'utility'].map((category) => {
              const categoryIntegrations = integrations.filter(i => i.category === category);
              const connectedInCategory = categoryIntegrations.filter(i => i.status === 'connected').length;
              
              return (
                <div key={category} className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-lg font-bold">
                    {connectedInCategory}/{categoryIntegrations.length}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {getCategoryLabel(category as Integration['category'])}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};