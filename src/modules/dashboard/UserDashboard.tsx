import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  FileText, 
  MessageSquare, 
  Calendar,
  AlertCircle,
  TrendingUp,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks';

interface DashboardWidget {
  title: string;
  description: string;
  icon: React.ReactNode;
  value?: string | number;
  change?: string;
  action?: {
    label: string;
    href: string;
  };
  status?: 'success' | 'warning' | 'error';
}

export function UserDashboard() {
  const { user } = useAuth();

  const widgets: DashboardWidget[] = [
    {
      title: 'Neste anbefalte handling',
      description: 'Oppdater forsikringsinformasjon',
      icon: <AlertCircle className="h-5 w-5" />,
      action: {
        label: 'Se detaljer',
        href: '/dashboard/recommendations'
      },
      status: 'warning'
    },
    {
      title: 'Åpne forespørsler',
      description: 'Du har 2 aktive forespørsler',
      icon: <MessageSquare className="h-5 w-5" />,
      value: '2',
      action: {
        label: 'Se alle',
        href: '/dashboard/requests'
      }
    },
    {
      title: 'Vedlikeholdsplan',
      description: 'Neste: Takstein kontroll',
      icon: <Calendar className="h-5 w-5" />,
      action: {
        label: 'Se plan',
        href: '/dashboard/maintenance'
      }
    },
    {
      title: 'Siste dokumenter',
      description: '3 dokumenter lagt til denne måneden',
      icon: <FileText className="h-5 w-5" />,
      value: '3',
      action: {
        label: 'Se alle',
        href: '/dashboard/documents'
      }
    }
  ];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Velkommen tilbake{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Her er en oversikt over din bolig og anbefalte handlinger.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ny forespørsel
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {widgets.map((widget, index) => (
          <Card key={index} className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {widget.title}
              </CardTitle>
              <div className={getStatusColor(widget.status)}>
                {widget.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {widget.value && (
                  <div className="text-2xl font-bold">{widget.value}</div>
                )}
                <p className="text-xs text-muted-foreground">
                  {widget.description}
                </p>
                {widget.status && (
                  <Badge 
                    variant={widget.status === 'warning' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {widget.status === 'warning' ? 'Krever oppmerksomhet' : 'OK'}
                  </Badge>
                )}
                {widget.action && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-0 text-xs font-normal text-primary hover:text-primary/80"
                  >
                    {widget.action.label}
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Min eiendom
            </CardTitle>
            <CardDescription>
              Oversikt over din registrerte eiendom
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Adresse</span>
                <span className="text-sm font-medium">Ikke registrert</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Type</span>
                <span className="text-sm font-medium">-</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Størrelse</span>
                <span className="text-sm font-medium">-</span>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Registrer eiendom
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Aktivitet
            </CardTitle>
            <CardDescription>
              Siste aktivitet på kontoen din
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm">Konto opprettet</p>
                  <p className="text-xs text-muted-foreground">I dag</p>
                </div>
              </div>
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Ingen flere aktiviteter ennå
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}