import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/modules/auth/hooks';
import { 
  BarChart3, 
  Users, 
  Building2, 
  FileText, 
  Shield, 
  Activity,
  TrendingUp,
  Database
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { isMasterAdmin } = useAuth();

  const stats = [
    {
      title: 'Total Brukere',
      value: '1,234',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Aktive Bedrifter',
      value: '456',
      change: '+8%',
      icon: Building2,
      color: 'text-green-600'
    },
    {
      title: 'Leads i dag',
      value: '89',
      change: '+23%',
      icon: FileText,
      color: 'text-orange-600'
    },
    {
      title: 'System Uptime',
      value: '99.9%',
      change: 'Stable',
      icon: Activity,
      color: 'text-emerald-600'
    }
  ];

  const adminTasks = [
    {
      title: 'Lead Distribution',
      description: 'Administrer lead-distribusjon og pakker',
      href: '/admin/leads',
      icon: FileText,
      urgent: false
    },
    {
      title: 'Brukeradministrasjon',
      description: 'Håndter brukerkontoer og tilganger',
      href: '/admin/members',
      icon: Users,
      urgent: false
    },
    {
      title: 'Systemovervåking',
      description: 'Overvåk systemytelse og feilmeldinger',
      href: '/admin/status',
      icon: Activity,
      urgent: true
    }
  ];

  const masterAdminTasks = [
    {
      title: 'Feature Flags',
      description: 'Administrer systemfunksjoner og eksperimenter',
      href: '/admin/feature-flags',
      icon: Shield,
      urgent: false
    },
    {
      title: 'Rolleadministrasjon',
      description: 'Håndter brukerroller og tillatelser',
      href: '/admin/roles',
      icon: Shield,
      urgent: false
    },
    {
      title: 'Database Administration',
      description: 'Administrer database og systemkonfigurasjon',
      href: '/admin/system-modules',
      icon: Database,
      urgent: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Systemkontrollpanel
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2">
          Oversikt over systemet og administrative oppgaver
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change} fra forrige måned
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Admin Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regular Admin Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Administrative Oppgaver
            </CardTitle>
            <CardDescription>
              Daglige administrative oppgaver og systemadministrasjon
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {adminTasks.map((task) => {
              const Icon = task.icon;
              return (
                <div key={task.title} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm">{task.title}</h3>
                      {task.urgent && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Master Admin Tasks */}
        {isMasterAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-600" />
                Master Admin Oppgaver
              </CardTitle>
              <CardDescription>
                Systemkonfigurasjon og avanserte administrative funksjoner
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {masterAdminTasks.map((task) => {
                const Icon = task.icon;
                return (
                  <div key={task.title} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm">{task.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hurtighandlinger</CardTitle>
          <CardDescription>
            Vanlige administrative oppgaver du kan utføre raskt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              Opprett ny bruker
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              Generer rapport
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              Sjekk systemstatus
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              Backup database
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;