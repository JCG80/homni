import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Clock,
  Database,
  Server,
  Zap,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

interface ServiceStatus {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'maintenance';
  responseTime: number;
  uptime: number;
  lastCheck: string;
  endpoint: string;
}

interface PerformanceMetric {
  name: string;
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

export const ApiGatewayStatus: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Mock data - in real app this would come from monitoring APIs
  const [services] = useState<ServiceStatus[]>([
    {
      id: 'supabase-db',
      name: 'Supabase Database',
      status: 'healthy',
      responseTime: 45,
      uptime: 99.9,
      lastCheck: '2024-01-15 14:32:00',
      endpoint: process.env.VITE_SUPABASE_URL || 'https://kkazhcihooovsuwravhs.supabase.co'
    },
    {
      id: 'auth-service',
      name: 'Authentication Service',
      status: 'healthy',
      responseTime: 123,
      uptime: 99.7,
      lastCheck: '2024-01-15 14:32:00',
      endpoint: '/auth/*'
    },
    {
      id: 'leads-api',
      name: 'Leads API',
      status: 'warning',
      responseTime: 234,
      uptime: 98.5,
      lastCheck: '2024-01-15 14:31:45',
      endpoint: '/api/leads/*'
    },
    {
      id: 'properties-api',
      name: 'Properties API',
      status: 'healthy',
      responseTime: 89,
      uptime: 99.8,
      lastCheck: '2024-01-15 14:32:00',
      endpoint: '/api/properties/*'
    },
    {
      id: 'analytics-engine',
      name: 'Analytics Engine',
      status: 'maintenance',
      responseTime: 0,
      uptime: 95.2,
      lastCheck: '2024-01-15 14:30:00',
      endpoint: '/api/analytics/*'
    }
  ]);

  const performanceMetrics: PerformanceMetric[] = [
    { name: 'API Response Time (P95)', current: 185, target: 200, unit: 'ms', trend: 'down' },
    { name: 'Database Query Time (P95)', current: 95, target: 100, unit: 'ms', trend: 'stable' },
    { name: 'Error Rate', current: 0.15, target: 1.0, unit: '%', trend: 'down' },
    { name: 'Requests per Minute', current: 1247, target: 2000, unit: 'req/min', trend: 'up' }
  ];

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'maintenance':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: ServiceStatus['status']) => {
    const variants = {
      healthy: 'default',
      warning: 'secondary',
      critical: 'destructive',
      maintenance: 'outline'
    } as const;

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  const overallHealth = services.filter(s => s.status === 'healthy').length / services.length * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Gateway Status</h1>
          <p className="text-muted-foreground">Real-time monitoring of system performance and health</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health Overview
          </CardTitle>
          <CardDescription>Current operational status across all services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl font-bold">{overallHealth.toFixed(1)}%</div>
            <Badge variant={overallHealth > 95 ? 'default' : overallHealth > 90 ? 'secondary' : 'destructive'}>
              {overallHealth > 95 ? 'Excellent' : overallHealth > 90 ? 'Good' : 'Needs Attention'}
            </Badge>
          </div>
          <Progress value={overallHealth} className="mb-2" />
          <div className="text-sm text-muted-foreground">
            {services.filter(s => s.status === 'healthy').length} of {services.length} services healthy
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              <TrendingUp className={`h-4 w-4 ${metric.trend === 'up' ? 'text-success' : metric.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.current.toLocaleString()} {metric.unit}
              </div>
              <div className="text-xs text-muted-foreground">
                Target: {metric.target.toLocaleString()} {metric.unit}
              </div>
              <Progress 
                value={(metric.current / metric.target) * 100} 
                className="mt-2" 
                max={100}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Service Status
          </CardTitle>
          <CardDescription>Individual service health and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {service.name === 'Supabase Database' ? <Database className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-muted-foreground">{service.endpoint}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">{service.responseTime}ms</div>
                    <div className="text-xs text-muted-foreground">Response Time</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{service.uptime}%</div>
                    <div className="text-xs text-muted-foreground">Uptime</div>
                  </div>
                  {getStatusBadge(service.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <CardDescription>System events and maintenance activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium">Leads API Performance Degradation</div>
                <div className="text-xs text-muted-foreground">2024-01-15 14:15 - Investigating increased response times</div>
              </div>
              <Badge variant="secondary">Monitoring</Badge>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium">Analytics Engine Scheduled Maintenance</div>
                <div className="text-xs text-muted-foreground">2024-01-15 14:00 - Planned maintenance window</div>
              </div>
              <Badge variant="outline">Maintenance</Badge>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-4 w-4 text-success mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium">Database Connection Pool Optimization</div>
                <div className="text-xs text-muted-foreground">2024-01-15 13:45 - Successfully resolved</div>
              </div>
              <Badge variant="default">Resolved</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};