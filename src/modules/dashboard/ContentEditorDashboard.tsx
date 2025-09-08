import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PenTool, 
  FileText, 
  Users, 
  Calendar,
  TrendingUp,
  Plus,
  ArrowRight,
  Edit3,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks';

interface ContentWidget {
  title: string;
  description: string;
  icon: React.ReactNode;
  value?: string | number;
  action?: {
    label: string;
    href: string;
  };
  status?: 'draft' | 'published' | 'review';
}

export function ContentEditorDashboard() {
  const { user } = useAuth();

  const widgets: ContentWidget[] = [
    {
      title: 'Ventende artikler',
      description: 'Artikler som trenger godkjenning',
      icon: <FileText className="h-5 w-5" />,
      value: '3',
      action: {
        label: 'Se alle',
        href: '/content/pending'
      },
      status: 'review'
    },
    {
      title: 'Publiserte artikler',
      description: 'Denne måneden',
      icon: <BookOpen className="h-5 w-5" />,
      value: '8',
      action: {
        label: 'Se publiserte',
        href: '/content/published'
      },
      status: 'published'
    },
    {
      title: 'Utkast',
      description: 'Upubliserte utkast',
      icon: <Edit3 className="h-5 w-5" />,
      value: '2',
      action: {
        label: 'Fortsett arbeid',
        href: '/content/drafts'
      },
      status: 'draft'
    },
    {
      title: 'Planlagte innlegg',
      description: 'Kommende publiseringer',
      icon: <Calendar className="h-5 w-5" />,
      value: '5',
      action: {
        label: 'Se kalender',
        href: '/content/scheduled'
      }
    }
  ];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'published': return 'text-green-600';
      case 'review': return 'text-yellow-600';
      case 'draft': return 'text-blue-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'review': return 'secondary';
      case 'draft': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Innholdshåndtering
          </h1>
          <p className="text-muted-foreground">
            Administrer artikler, sider og innhold på plattformen.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ny artikkel
        </Button>
      </div>

      {/* Content Stats */}
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
                    variant={getStatusBadge(widget.status) as any}
                    className="text-xs"
                  >
                    {widget.status === 'published' ? 'Publisert' : 
                     widget.status === 'review' ? 'Til godkjenning' : 
                     widget.status === 'draft' ? 'Utkast' : 'Ukjent'}
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
              <PenTool className="h-5 w-5" />
              Siste endringer
            </CardTitle>
            <CardDescription>
              Nylig redigert innhold
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Boligtips for vinteren</span>
                  <p className="text-xs text-muted-foreground">Artikkel oppdatert</p>
                </div>
                <Badge variant="secondary">Publisert</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Forsikringsguide 2024</span>
                  <p className="text-xs text-muted-foreground">Ny artikkel opprettet</p>
                </div>
                <Badge variant="outline">Utkast</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">FAQ - Vanlige spørsmål</span>
                  <p className="text-xs text-muted-foreground">Side oppdatert</p>
                </div>
                <Badge variant="secondary">Til godkjenning</Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Se alle endringer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ytelse
            </CardTitle>
            <CardDescription>
              Innholdsstatistikk siste 30 dager
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Sidevisninger</span>
                <span className="text-sm font-medium">12,847</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Mest leste artikkel</span>
                <span className="text-sm font-medium">Boligtips for vinteren</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Gjennomsnittlig lesetid</span>
                <span className="text-sm font-medium">3m 42s</span>
              </div>
              <div className="text-center py-4 border-t">
                <Button variant="outline" size="sm">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Detaljert rapport
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}