/**
 * Market & Tech Documentation Viewer for Master Admin
 * Displays markdown content for market trends and technical documentation
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  TrendingDown, 
  Code, 
  Database, 
  Globe, 
  BarChart3, 
  Users,
  DollarSign,
  Zap,
  RefreshCw
} from 'lucide-react';

interface MarketMetric {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface TechStatus {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  version: string;
  lastUpdate: string;
}

export const MarketTrendsMD: React.FC = () => {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Mock market data - in real app this would come from APIs
  const marketMetrics: MarketMetric[] = [
    { label: 'Aktive leads', value: '2,847', change: 12.5, trend: 'up' },
    { label: 'Nye bedrifter', value: '43', change: -5.2, trend: 'down' },
    { label: 'Konverteringsrate', value: '18.3%', change: 3.1, trend: 'up' },
    { label: 'Avg. lead verdi', value: 'NOK 2,450', change: 8.7, trend: 'up' },
    { label: 'Aktive brukere', value: '15,234', change: 15.8, trend: 'up' },
    { label: 'Sesjon lengde', value: '4m 32s', change: -2.1, trend: 'down' }
  ];

  const techComponents: TechStatus[] = [
    { component: 'API Gateway', status: 'healthy', version: 'v1.2.3', lastUpdate: '2 timer siden' },
    { component: 'Database', status: 'healthy', version: 'PostgreSQL 15', lastUpdate: '1 dag siden' },
    { component: 'Edge Functions', status: 'warning', version: 'v2.1.0', lastUpdate: '12 timer siden' },
    { component: 'CDN', status: 'healthy', version: 'Cloudflare', lastUpdate: '3 timer siden' },
    { component: 'Analytics', status: 'healthy', version: 'v3.0.1', lastUpdate: '6 timer siden' }
  ];

  const handleRefresh = () => {
    setLastRefresh(new Date());
    // Trigger data refresh
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <div className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Market & Tech</h1>
          <p className="text-muted-foreground">
            Markedstrender og teknisk status oversikt
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Sist oppdatert: {lastRefresh.toLocaleTimeString('nb-NO')}
          </span>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Oppdater
          </Button>
        </div>
      </div>

      <Tabs defaultValue="market" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="market">
            <BarChart3 className="h-4 w-4 mr-2" />
            Markedstrender
          </TabsTrigger>
          <TabsTrigger value="tech">
            <Code className="h-4 w-4 mr-2" />
            Teknisk Status
          </TabsTrigger>
          <TabsTrigger value="docs">
            <Globe className="h-4 w-4 mr-2" />
            Dokumentasjon
          </TabsTrigger>
        </TabsList>

        {/* Market Trends */}
        <TabsContent value="market" className="space-y-6">
          {/* Market Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {metric.label}
                      </p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(metric.trend)}
                      <span className={`text-sm font-medium ${
                        metric.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Market Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Markedsanalyse
              </CardTitle>
              <CardDescription>
                Detaljert analyse av markedstrender og forretningsytelse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="prose max-w-none">
                  <h3>Q4 2024 Sammendrag</h3>
                  <p>
                    Markedet viser sterke veksttegn med økning i både aktive leads og 
                    konverteringsrater. Spesielt elektriker- og rørleggersegmentene 
                    driver veksten.
                  </p>
                  
                  <h4>Nøkkeltrender</h4>
                  <ul>
                    <li><strong>Lead kvalitet forbedres:</strong> 18.3% konverteringsrate (+3.1%)</li>
                    <li><strong>Økt brukerengasjement:</strong> 15,234 aktive brukere (+15.8%)</li>
                    <li><strong>Prissetting optimaliseres:</strong> Gjennomsnittlig lead verdi NOK 2,450</li>
                  </ul>

                  <h4>Utfordringer</h4>
                  <ul>
                    <li>Redusert sesjonslengde (-2.1%) kan indikere UX-problemer</li>
                    <li>Færre nye bedrifter registrerer seg (-5.2%)</li>
                    <li>Behov for forbedret onboarding-prosess</li>
                  </ul>

                  <h4>Anbefalinger</h4>
                  <ol>
                    <li>Fokuser på å forbedre brukeropplevelsen for lengre sesjoner</li>
                    <li>Implementer målrettede kampanjer for bedriftsregistrering</li>
                    <li>Optimaliser lead-distribusjonsalgoritmen</li>
                  </ol>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technical Status */}
        <TabsContent value="tech" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* System Components */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Systemkomponenter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {techComponents.map((component, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{component.component}</p>
                        <p className="text-sm text-muted-foreground">{component.version}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(component.status)}>
                          {component.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {component.lastUpdate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Ytelse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Response Time</span>
                    <span className="text-sm font-mono">142ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Database Query Time</span>
                    <span className="text-sm font-mono">23ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">CDN Hit Rate</span>
                    <span className="text-sm font-mono">94.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Error Rate</span>
                    <span className="text-sm font-mono">0.03%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technical Documentation */}
          <Card>
            <CardHeader>
              <CardTitle>Teknisk Arkitektur</CardTitle>
              <CardDescription>
                Oversikt over systemarkitektur og tekniske spesifikasjoner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="prose max-w-none">
                  <h3>Arkitekturoversikt</h3>
                  <p>
                    Homni bygger på en moderne, skalerbar arkitektur med følgende hovedkomponenter:
                  </p>
                  
                  <h4>Frontend</h4>
                  <ul>
                    <li><strong>React 18:</strong> Moderne UI-rammeverk med hooks og concurrent features</li>
                    <li><strong>TypeScript:</strong> Typesikkerhet og bedre utvikleropplevelse</li>
                    <li><strong>Tailwind CSS:</strong> Utility-first CSS framework</li>
                    <li><strong>Vite:</strong> Rask byggverktøy og dev server</li>
                  </ul>

                  <h4>Backend</h4>
                  <ul>
                    <li><strong>Supabase:</strong> Backend-as-a-Service med PostgreSQL</li>
                    <li><strong>Row Level Security (RLS):</strong> Databassikkerhet på radnivå</li>
                    <li><strong>Edge Functions:</strong> Serverless functions for API-logikk</li>
                    <li><strong>Real-time subscriptions:</strong> Live oppdateringer</li>
                  </ul>

                  <h4>API Gateway</h4>
                  <ul>
                    <li><strong>FastAPI:</strong> Moderne Python web framework</li>
                    <li><strong>JWT Authentication:</strong> Sikker tokenbasert autentisering</li>
                    <li><strong>Rate limiting:</strong> Beskyttelse mot misbruk</li>
                    <li><strong>OpenAPI dokumentasjon:</strong> Automatisk API-dokumentasjon</li>
                  </ul>

                  <h4>Sikkerhet</h4>
                  <ul>
                    <li>Role-based access control (RBAC)</li>
                    <li>Encrypted data at rest and in transit</li>
                    <li>Regular security audits</li>
                    <li>GDPR compliance</li>
                  </ul>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentation */}
        <TabsContent value="docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Systemdokumentasjon
              </CardTitle>
              <CardDescription>
                Lenker til viktige dokumentasjon og ressurser
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">API Dokumentasjon</h4>
                  <ul className="space-y-1">
                    <li><a href="/docs/api/openapi.yaml" className="text-blue-600 hover:underline">OpenAPI Specification</a></li>
                    <li><a href="#" className="text-blue-600 hover:underline">Postman Collection</a></li>
                    <li><a href="#" className="text-blue-600 hover:underline">Authentication Guide</a></li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Utviklerdokumentasjon</h4>
                  <ul className="space-y-1">
                    <li><a href="#" className="text-blue-600 hover:underline">Setup Guide</a></li>
                    <li><a href="#" className="text-blue-600 hover:underline">Contributing Guidelines</a></li>
                    <li><a href="#" className="text-blue-600 hover:underline">Code Standards</a></li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Deployment</h4>
                  <ul className="space-y-1">
                    <li><a href="#" className="text-blue-600 hover:underline">CI/CD Pipeline</a></li>
                    <li><a href="#" className="text-blue-600 hover:underline">Environment Config</a></li>
                    <li><a href="#" className="text-blue-600 hover:underline">Monitoring Setup</a></li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Troubleshooting</h4>
                  <ul className="space-y-1">
                    <li><a href="#" className="text-blue-600 hover:underline">Common Issues</a></li>
                    <li><a href="#" className="text-blue-600 hover:underline">Debug Guide</a></li>
                    <li><a href="#" className="text-blue-600 hover:underline">Performance Tips</a></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};