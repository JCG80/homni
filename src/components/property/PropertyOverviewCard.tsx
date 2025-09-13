import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Home, 
  TrendingUp, 
  Calendar, 
  FileText, 
  AlertTriangle,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PropertyOverviewData {
  totalProperties: number;
  totalValue: number;
  pendingMaintenance: number;
  documentsCount: number;
  upcomingTasks: number;
  completionRate: number;
}

interface PropertyOverviewCardProps {
  data: PropertyOverviewData;
  isLoading?: boolean;
}

export const PropertyOverviewCard: React.FC<PropertyOverviewCardProps> = ({ 
  data, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Eiendommer',
      value: data.totalProperties,
      icon: Home,
      description: 'Totalt registrert',
      color: 'text-blue-600',
      href: '/properties'
    },
    {
      title: 'Estimert verdi',
      value: `${(data.totalValue / 1000000).toFixed(1)}M kr`,
      icon: TrendingUp,
      description: 'Samlet portefølje',
      color: 'text-green-600',
      href: '/properties?tab=analytics'
    },
    {
      title: 'Vedlikehold',
      value: data.pendingMaintenance,
      icon: Calendar,
      description: 'Ventende oppgaver',
      color: data.pendingMaintenance > 0 ? 'text-orange-600' : 'text-green-600',
      href: '/properties?tab=maintenance'
    },
    {
      title: 'Dokumenter',
      value: data.documentsCount,
      icon: FileText,
      description: 'Lagrede filer',
      color: 'text-purple-600',
      href: '/properties?tab=documents'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow cursor-pointer">
            <Link to={stat.href}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm font-medium">{stat.title}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Hurtighandlinger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                <Link to="/properties/new">
                  <Plus className="w-4 h-4" />
                  <span className="text-xs">Ny eiendom</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                <Link to="/properties?tab=documents">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs">Last opp dokument</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                <Link to="/properties?tab=maintenance">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">Planlegg vedlikehold</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto flex-col gap-2 p-4">
                <Link to="/properties?tab=propr">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Vurder verdi</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Vedlikeholdsstatus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fullført</span>
                <span>{data.completionRate}%</span>
              </div>
              <Progress value={data.completionRate} className="h-2" />
            </div>
            
            {data.upcomingTasks > 0 && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <div className="text-sm">
                  <p className="font-medium text-orange-800">
                    {data.upcomingTasks} kommende oppgaver
                  </p>
                  <p className="text-orange-600">Dette må gjøres snart</p>
                </div>
              </div>
            )}
            
            <Button asChild size="sm" className="w-full">
              <Link to="/properties?tab=maintenance">
                Se alle oppgaver
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};