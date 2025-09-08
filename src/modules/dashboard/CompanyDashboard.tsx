import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Users,
  Calendar,
  BarChart3,
  Plus,
  ArrowRight,
  Target,
  Clock
} from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks';

export function CompanyDashboard() {
  const { user, profile } = useAuth();

  // Simple mock data for now
  const metrics = [
    {
      title: 'Nye leads i dag',
      value: '5',
      change: '+20%',
      trend: 'up',
      icon: <Target className="h-5 w-5" />,
      description: 'Sammenlignet med i går'
    },
    {
      title: 'Aktive leads',
      value: '23',
      change: 'av 45 totalt',
      trend: 'neutral',
      icon: <Briefcase className="h-5 w-5" />,
      description: 'Krever oppfølging'
    },
    {
      title: 'Konverteringsrate',
      value: '24%',
      change: 'Over målsetting',
      trend: 'up',
      icon: <TrendingUp className="h-5 w-5" />,
      description: 'Siste 30 dager'
    },
    {
      title: 'Gjennomsnittlig verdi',
      value: '45,000 kr',
      change: 'Per lead',
      trend: 'neutral',
      icon: <DollarSign className="h-5 w-5" />,
      description: 'Estimert verdi'
    }
  ];

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bedriftsdashboard
          </h1>
          <p className="text-muted-foreground">
            Oversikt over leads, budsjett og ytelse for din bedrift.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Rapporter
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Juster budsjett
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className="text-muted-foreground">
                {metric.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {metric.change && (
                <p className={`text-xs ${getTrendColor(metric.trend)}`}>
                  {metric.change}
                </p>
              )}
              {metric.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Aktive leads (23)
            </CardTitle>
            <CardDescription>
              Leads som krever din oppmerksomhet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium">Forsikring for nybygg</p>
                  <p className="text-xs text-muted-foreground">
                    Boligforsikring • I dag
                  </p>
                </div>
                <Badge variant="secondary">Ny</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium">Reiseforsikring familie</p>
                  <p className="text-xs text-muted-foreground">
                    Reiseforsikring • I går
                  </p>
                </div>
                <Badge variant="outline">Kontaktet</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium">Yrkesskadeforsikring</p>
                  <p className="text-xs text-muted-foreground">
                    Bedriftsforsikring • 2 dager siden
                  </p>
                </div>
                <Badge variant="default">Forhandling</Badge>
              </div>
              
              <Button variant="outline" size="sm" className="w-full">
                Se alle leads (23)
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Siste aktivitet
            </CardTitle>
            <CardDescription>
              Nylige endringer og oppdateringer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm">Lead konvertert til kunde</p>
                  <p className="text-xs text-muted-foreground">
                    for 2 timer siden
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm">Nytt lead mottatt</p>
                  <p className="text-xs text-muted-foreground">
                    for 4 timer siden
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm">Lead kontaktet</p>
                  <p className="text-xs text-muted-foreground">
                    i går
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm">Lead oppdatert</p>
                  <p className="text-xs text-muted-foreground">
                    i går
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Ytelsesindikerer
          </CardTitle>
          <CardDescription>
            Nøkkeltall basert på dine leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">12</div>
              <p className="text-sm text-muted-foreground">Konverterte leads</p>
              <p className="text-xs text-muted-foreground">27% av totalt</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">23</div>
              <p className="text-sm text-muted-foreground">Nye muligheter</p>
              <p className="text-xs text-muted-foreground">Krever oppfølging</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">24%</div>
              <p className="text-sm text-muted-foreground">Suksessrate</p>
              <p className="text-xs text-muted-foreground">Over målsetting</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}