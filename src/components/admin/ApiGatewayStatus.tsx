/**
 * API Gateway Status Dashboard for Master Admin
 * Shows real-time status of API Gateway and related services
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Activity, 
  Clock, 
  Database, 
  Zap,
  TrendingUp,
  Shield,
  Globe
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  uptime: number;
  lastCheck: string;
  endpoint: string;
}

interface ApiMetrics {
  requestsPerMinute: number;
  errorRate: number;
  avgResponseTime: number;
  activeConnections: number;
}

export const ApiGatewayStatus: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Mock data - in real app this would come from monitoring APIs
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'API Gateway',
      status: 'healthy',
      responseTime: 142,
      uptime: 99.97,
      lastCheck: new Date().toISOString(),
      endpoint: '/v1/health'
    },
    {
      name: 'Supabase Database',
      status: 'healthy', 
      responseTime: 23,
      uptime: 99.99,
      lastCheck: new Date().toISOString(),
      endpoint: 'postgresql://...'
    },
    {
      name: 'Edge Functions',
      status: 'degraded',
      responseTime: 340,
      uptime: 98.2,
      lastCheck: new Date().toISOString(),
      endpoint: '/functions/v1/*'
    },
    {
      name: 'Authentication Service',
      status: 'healthy',
      responseTime: 89,
      uptime: 99.95,
      lastCheck: new Date().toISOString(),
      endpoint: '/auth/v1/*'
    },
    {
      name: 'File Storage',
      status: 'healthy',
      responseTime: 156,
      uptime: 99.8,
      lastCheck: new Date().toISOString(),
      endpoint: '/storage/v1/*'
    }
  ]);

  const [metrics, setMetrics] = useState<ApiMetrics>({
    requestsPerMinute: 847,
    errorRate: 0.02,
    avgResponseTime: 142,
    activeConnections: 23
  });

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastRefresh(new Date());
    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const overallStatus = services.every(s => s.status === 'healthy') 
    ? 'healthy' 
    : services.some(s => s.status === 'unhealthy') 
    ? 'unhealthy' 
    : 'degraded';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Gateway Status</h1>
          <p className="text-muted-foreground">
            Real-time monitoring av API Gateway og tjenester
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Sist oppdatert: {lastRefresh.toLocaleTimeString('nb-NO')}
          </span>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Oppdaterer...' : 'Oppdater'}
          </Button>
        </div>
      </div>

      {/* Overall Status Alert */}
      {overallStatus !== 'healthy' && (
        <Alert variant={overallStatus === 'unhealthy' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {overallStatus === 'unhealthy' ? 'System Issue Detected' : 'Service Degradation'}
          </AlertTitle>
          <AlertDescription>
            {overallStatus === 'unhealthy' 
              ? 'En eller flere kritiske tjenester er nede. Sjekk service status nedenfor.'
              : 'Noen tjenester opplever redusert ytelse. Overvåker situasjonen.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Requests/min
                </p>
                <p className="text-2xl font-bold">{metrics.requestsPerMinute}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Error Rate
                </p>
                <p className="text-2xl font-bold">{metrics.errorRate}%</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Response
                </p>
                <p className="text-2xl font-bold">{metrics.avgResponseTime}ms</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Connections
                </p>
                <p className="text-2xl font-bold">{metrics.activeConnections}</p>
              </div>
              <Globe className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Tjenestestatus
          </CardTitle>
          <CardDescription>
            Status og ytelse for alle API Gateway-tjenester
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.endpoint}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm font-medium">{service.responseTime}ms</p>
                    <p className="text-xs text-muted-foreground">Response</p>
                  </div>
                  
                  <div className="text-center min-w-[80px]">
                    <p className="text-sm font-medium">{service.uptime}%</p>
                    <p className="text-xs text-muted-foreground">Uptime</p>
                    <Progress value={service.uptime} className="w-16 h-2 mt-1" />
                  </div>
                  
                  <Badge className={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Response Time Trend
            </CardTitle>
            <CardDescription>
              Gjennomsnittstid for API-respons de siste 24 timer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-muted-foreground">Chart placeholder - Response time over time</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Request Volume
            </CardTitle>
            <CardDescription>
              Antall requests per time de siste 24 timer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-muted-foreground">Chart placeholder - Request volume over time</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Status</CardTitle>
          <CardDescription>
            Current API Gateway configuration and feature flags
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Rate Limiting</h4>
              <ul className="space-y-1 text-sm">
                <li>Anonymous: 100/hour ✓</li>
                <li>Authenticated: 1000/hour ✓</li>
                <li>Admin: 5000/hour ✓</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Security</h4>
              <ul className="space-y-1 text-sm">
                <li>JWT Authentication ✓</li>
                <li>CORS Enabled ✓</li>
                <li>HTTPS Only ✓</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Features</h4>
              <ul className="space-y-1 text-sm">
                <li>Smart Lead Distribution ✓</li>
                <li>Real-time Notifications ✓</li>
                <li>File Upload ✓</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Monitoring</h4>
              <ul className="space-y-1 text-sm">
                <li>Health Checks ✓</li>
                <li>Error Tracking ✓</li>
                <li>Performance Metrics ✓</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};