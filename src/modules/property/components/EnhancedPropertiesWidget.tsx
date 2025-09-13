import React, { useState } from 'react';
import { useProperties } from '../hooks/useProperties';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatters';
import { 
  Home, 
  Plus, 
  ArrowRight, 
  Loader2,
  TrendingUp,
  AlertCircle,
  Calendar,
  Wrench,
  FileText,
  DollarSign,
  MapPin,
  Star
} from 'lucide-react';

export const EnhancedPropertiesWidget: React.FC = () => {
  const { properties, isLoading, error } = useProperties();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Laster eiendommer...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive">Kunne ikke laste eiendommer</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-2">
            Prøv igjen
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50" />
        <CardContent className="relative text-center py-12">
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Home className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Ingen eiendommer ennå</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start med å registrere din første eiendom for å få tilgang til omfattende eiendomsforvaltning, 
            vedlikeholdsplanlegging og markedsanalyser.
          </p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/properties/new')} size="lg" className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Legg til første eiendom
            </Button>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Vedlikeholdsplanlegging
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Verdisporing
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Dokumenthåndtering
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics
  const totalValue = properties.reduce((sum, property) => sum + ((property as any).current_value || 0), 0);
  const averageValue = totalValue / properties.length;
  const newestProperty = properties.reduce((newest, property) => 
    new Date(property.created_at) > new Date(newest.created_at) ? property : newest
  );

  // Mock data for enhanced features
  const maintenanceAlerts = 2;
  const documentsCount = properties.length * 3; // Simulated
  const upcomingTasks = 5;

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Home className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-800">Eiendommer</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{properties.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-800">Total verdi</span>
            </div>
            <div className="text-lg font-bold text-green-900">
              {totalValue > 0 ? formatCurrency(totalValue) : 'Ikke satt'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-800">Vedlikehold</span>
            </div>
            <div className="text-2xl font-bold text-orange-900">{maintenanceAlerts}</div>
            <div className="text-xs text-orange-700">varsler</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-800">Dokumenter</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{documentsCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Widget */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Mine eiendommer
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/properties')}>
              Se alle
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="overview">Oversikt</TabsTrigger>
              <TabsTrigger value="maintenance">Vedlikehold</TabsTrigger>
              <TabsTrigger value="analytics">Analyser</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Property List */}
              <div className="space-y-3">
                {properties.slice(0, 3).map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/properties/${property.id}`)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Home className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">{property.name}</p>
                          <Badge variant="secondary" className="text-xs">
                            {property.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {property.address && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{property.address}</span>
                            </div>
                          )}
                          {(property as any).current_value && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span>{formatCurrency((property as any).current_value)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm">
                        <div className="text-green-600 font-medium">Godt vedlikeholdt</div>
                        <div className="text-xs text-muted-foreground">Sist oppdatert for 2 uker siden</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                ))}
              </div>

              {properties.length > 3 && (
                <div className="pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/properties')}
                    className="w-full flex items-center gap-2"
                  >
                    Se alle {properties.length} eiendommer
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-orange-900">Viktig vedlikehold</p>
                      <p className="text-sm text-orange-700">2 oppgaver krever oppmerksomhet</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="border-orange-300">
                    Se detaljer
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Kommende oppgaver</p>
                      <p className="text-sm text-blue-700">{upcomingTasks} oppgaver neste måned</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="border-blue-300">
                    Planlegg
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Wrench className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Automatisk vedlikehold</p>
                      <p className="text-sm text-green-700">Sett opp påminnelser for rutineoppgaver</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="border-green-300">
                    Konfigurer
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Porteføljeutvikling</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Gjennomsnittlig verdi</span>
                        <span className="font-medium">
                          {averageValue > 0 ? formatCurrency(averageValue) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Siste tillegg</span>
                        <span className="font-medium">{newestProperty.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Vekstrate</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          +12.5%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Ytelse score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Vedlikeholdsstatus</span>
                          <span className="text-sm font-medium">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Dokumentasjon</span>
                          <span className="text-sm font-medium">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Excellent performance</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/analytics/properties')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Se detaljerte analyser
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};