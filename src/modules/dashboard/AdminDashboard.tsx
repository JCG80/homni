import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Activity, 
  Users, 
  AlertTriangle,
  Database,
  Server,
  FileText,
  TrendingUp,
  Settings,
  Eye,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks';

interface SystemMetric {
  title: string;
  value: string | number;
  status: 'healthy' | 'warning' | 'error';
  icon: React.ReactNode;
  description?: string;
}

export function AdminDashboard() {
  const { user } = useAuth();

  const systemMetrics: SystemMetric[] = [
    {
      title: 'Systemhelse',
      value: '99.8%',
      status: 'healthy',
      icon: <Activity className="h-5 w-5" />,
      description: 'Oppetid siste 30 dager'
    },
    {
      title: 'Leads siste 24t',
      value: '142',
      status: 'healthy',
      icon: <TrendingUp className="h-5 w-5" />,
      description: '+12% fra i går'
    },
    {
      title: 'Åpne supportsaker',
      value: '3',
      status: 'warning',
      icon: <AlertTriangle className="h-5 w-5" />,
      description: '1 høy prioritet'
    },
    {
      title: 'Database ytelse',
      value: '45ms',
      status: 'healthy',
      icon: <Database className="h-5 w-5" />,
      description: 'Avg. responstid'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge className="bg-green-100 text-green-800">OK</Badge>;
      case 'warning': return <Badge variant="destructive">Advarsel</Badge>;
      case 'error': return <Badge variant="destructive">Feil</Badge>;
      default: return <Badge variant="secondary">Ukjent</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Systemovervåking, brukerstøtte og plattformsadministrasjon.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Audit log
          </Button>
          <Button className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Systeminnstillinger
          </Button>
        </div>
      </div>

      {/* System Health Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {systemMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className={getStatusColor(metric.status)}>
                {metric.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center justify-between mt-2">
                {metric.description && (
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                )}
                {getStatusBadge(metric.status)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Tools & Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Brukerstyring
            </CardTitle>
            <CardDescription>
              Nylige brukeraktiviteter og administrasjon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium">Ny bedrift registrert</p>
                  <p className="text-xs text-muted-foreground">RørService AS - 10 min siden</p>
                </div>
                <Badge variant="secondary">Ny</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium">Brukerstøtte: Premium oppgradering</p>
                  <p className="text-xs text-muted-foreground">TakMeister AS - 25 min siden</p>
                </div>
                <Badge>Support</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium">Bruker deaktivert</p>
                  <p className="text-xs text-muted-foreground">Brudd på vilkår - 1t siden</p>
                </div>
                <Badge variant="destructive">Moderering</Badge>
              </div>
              
              <Button variant="outline" size="sm" className="w-full">
                Se alle brukere
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Systemstatus
            </CardTitle>
            <CardDescription>
              Infrastruktur og tjenestestatus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">Database</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Operativ</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">API Gateway</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Operativ</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span className="text-sm">Lead Distribution</span>
                </div>
                <Badge variant="secondary">Maintenance</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">Email Service</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Operativ</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Actions & Quick Access */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Siste handlinger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm">Lead manuelt tildelt</p>
                  <p className="text-xs text-muted-foreground">5 min siden</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm">Bedrift godkjent</p>
                  <p className="text-xs text-muted-foreground">15 min siden</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm">Supportssak eskalert</p>
                  <p className="text-xs text-muted-foreground">30 min siden</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hurtigtilgang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Administrer brukere
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                Roller og tilganger
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Systemrapporter
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Systemkonfigurasjon
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dagens sammendrag</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold">127</div>
                <p className="text-sm text-muted-foreground">Nye leads</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">8</div>
                <p className="text-sm text-muted-foreground">Nye bedrifter</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">12</div>
                <p className="text-sm text-muted-foreground">Support henvendelser</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}