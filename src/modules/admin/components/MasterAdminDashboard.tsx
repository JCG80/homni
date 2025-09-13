import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Database, 
  Server, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Users,
  Settings,
  MonitorSpeaker,
  Zap,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdvancedAnalytics } from './AdvancedAnalytics';
import { SystemIntegrationsPanel } from './SystemIntegrationsPanel';
import { UserManagementPanel } from './UserManagementPanel';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  database: {
    status: 'connected' | 'slow' | 'disconnected';
    responseTime: number;
    activeConnections: number;
  };
  authentication: {
    status: 'operational' | 'degraded' | 'down';
    activeUsers: number;
    sessionsToday: number;
  };
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    responseTime: number;
  };
  security: {
    failedLogins: number;
    suspiciousActivity: number;
    lastSecurityScan: string;
  };
}

const fetchSystemHealth = async (): Promise<SystemHealth> => {
  // In production, this would fetch real system metrics
  // For now, we'll simulate the data
  
  const dbStart = Date.now();
  const { error: dbError } = await supabase.from('user_profiles').select('count').limit(1);
  const dbResponseTime = Date.now() - dbStart;

  return {
    status: 'healthy',
    database: {
      status: dbError ? 'disconnected' : dbResponseTime > 200 ? 'slow' : 'connected',
      responseTime: dbResponseTime,
      activeConnections: 12
    },
    authentication: {
      status: 'operational',
      activeUsers: 156,
      sessionsToday: 342
    },
    performance: {
      cpuUsage: Math.floor(Math.random() * 30) + 20,
      memoryUsage: Math.floor(Math.random() * 40) + 30,
      diskUsage: Math.floor(Math.random() * 20) + 15,
      responseTime: dbResponseTime
    },
    security: {
      failedLogins: 3,
      suspiciousActivity: 0,
      lastSecurityScan: new Date().toISOString()
    }
  };
};

export const MasterAdminDashboard: React.FC = () => {
  const { data: systemHealth, isLoading, error } = useQuery({
    queryKey: ['system-health'],
    queryFn: fetchSystemHealth,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Master Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-8 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !systemHealth) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Kunne ikke laste systemhelse data. Sjekk tilkoblingen.
        </AlertDescription>
      </Alert>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'operational':
        return 'text-green-600';
      case 'warning':
      case 'slow':
      case 'degraded':
        return 'text-yellow-600';
      case 'critical':
      case 'disconnected':
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
      case 'slow':
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
      case 'disconnected':
      case 'down':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Master Admin Dashboard</h1>
          <p className="text-muted-foreground">System oversikt og administrasjon</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={systemHealth.status === 'healthy' ? 'default' : 'destructive'}>
            {getStatusIcon(systemHealth.status)}
            <span className="ml-1 capitalize">{systemHealth.status}</span>
          </Badge>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Database</p>
                <p className={`text-lg font-semibold ${getStatusColor(systemHealth.database.status)}`}>
                  {systemHealth.database.status}
                </p>
                <p className="text-xs text-muted-foreground">
                  {systemHealth.database.responseTime}ms responstid
                </p>
              </div>
              <Database className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Autentisering</p>
                <p className={`text-lg font-semibold ${getStatusColor(systemHealth.authentication.status)}`}>
                  {systemHealth.authentication.status}
                </p>
                <p className="text-xs text-muted-foreground">
                  {systemHealth.authentication.activeUsers} aktive brukere
                </p>
              </div>
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CPU Bruk</p>
                <p className="text-lg font-semibold">{systemHealth.performance.cpuUsage}%</p>
                <p className="text-xs text-muted-foreground">
                  Normal belastning
                </p>
              </div>
              <Server className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sikkerhet</p>
                <p className="text-lg font-semibold text-green-600">Sikker</p>
                <p className="text-xs text-muted-foreground">
                  {systemHealth.security.failedLogins} mislykkede innlogginger
                </p>
              </div>
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      {systemHealth.security.suspiciousActivity > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {systemHealth.security.suspiciousActivity} mistenkelig aktivitet oppdaget. 
            <Button variant="link" className="p-0 ml-2">Se detaljer</Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Oversikt</TabsTrigger>
          <TabsTrigger value="analytics">Analyse</TabsTrigger>
          <TabsTrigger value="users">Brukere</TabsTrigger>
          <TabsTrigger value="integrations">Integrasjoner</TabsTrigger>
          <TabsTrigger value="monitoring">Overvåking</TabsTrigger>
          <TabsTrigger value="settings">Innstillinger</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Ytelse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">CPU Bruk</span>
                    <span className="text-sm">{systemHealth.performance.cpuUsage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${systemHealth.performance.cpuUsage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Minne</span>
                    <span className="text-sm">{systemHealth.performance.memoryUsage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${systemHealth.performance.memoryUsage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Disk</span>
                    <span className="text-sm">{systemHealth.performance.diskUsage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${systemHealth.performance.diskUsage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Bruker Aktivitet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Aktive Brukere</span>
                    <span className="text-lg font-bold">{systemHealth.authentication.activeUsers}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Økter i Dag</span>
                    <span className="text-lg font-bold">{systemHealth.authentication.sessionsToday}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">DB Tilkoblinger</span>
                    <span className="text-lg font-bold">{systemHealth.database.activeConnections}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <AdvancedAnalytics />
        </TabsContent>

        <TabsContent value="users">
          <UserManagementPanel />
        </TabsContent>

        <TabsContent value="integrations">
          <SystemIntegrationsPanel />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MonitorSpeaker className="h-5 w-5" />
                System Overvåking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detaljert system overvåking kommer snart. Dette vil inkludere real-time metrics, 
                alerting, og historisk data analyse.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Innstillinger
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Master admin innstillinger for systemkonfigurasjon, sikkerhet, og 
                ytelsesoptimalisering kommer snart.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};