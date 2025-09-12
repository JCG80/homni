/**
 * Unified Dashboard - Cross-module insights and actions
 * Integrates data from Bytt.no, Boligmappa.no, and Propr.no modules
 */
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home, 
  TrendingUp, 
  FileText, 
  Users, 
  AlertCircle, 
  CheckCircle,
  ArrowRight,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import { moduleManager, type CrossModuleInsight } from './ModuleManager';
import { useAuth } from '@/modules/auth/hooks';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface DashboardData {
  metrics: {
    total_properties: number;
    active_leads: number;
    selling_processes: number;
    potential_savings: number;
  };
  insights: CrossModuleInsight[];
  recent_activity: any[];
  recommendations: any[];
}

export const UnifiedDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardData = await moduleManager.getDashboardData(user!.id);
      setData(dashboardData);
    } catch (error) {
      logger.error('Failed to load dashboard data', {
        module: 'UnifiedDashboard',
        action: 'loadDashboardData',
        userId: user?.id
      }, error);
      toast.error('Kunne ikke laste dashboard-data');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiatePropertySale = async (propertyId: string) => {
    try {
      await moduleManager.initiatePropertySale(propertyId);
      await loadDashboardData(); // Refresh data
    } catch (error) {
      // Error handled in moduleManager
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'property_added': return <Home className="h-4 w-4" />;
      case 'lead_received': return <Users className="h-4 w-4" />;
      case 'selling_started': return <TrendingUp className="h-4 w-4" />;
      case 'document_uploaded': return <FileText className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Kunne ikke laste dashboard-data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Mine eiendommer
                  </p>
                  <p className="text-2xl font-bold">{data.metrics.total_properties}</p>
                </div>
                <Home className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Aktive leads
                  </p>
                  <p className="text-2xl font-bold">{data.metrics.active_leads}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Salgsprosesser
                  </p>
                  <p className="text-2xl font-bold">{data.metrics.selling_processes}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Potensielle besparelser
                  </p>
                  <p className="text-2xl font-bold">
                    {data.metrics.potential_savings.toLocaleString('no-NO')} kr
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Oversikt</TabsTrigger>
          <TabsTrigger value="insights">Innsikter</TabsTrigger>
          <TabsTrigger value="activity">Aktivitet</TabsTrigger>
          <TabsTrigger value="recommendations">Anbefalinger</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Cross-Module Insights Preview */}
          {data.insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Smarte innsikter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.insights.slice(0, 3).map((insight) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getPriorityColor(insight.priority)}>
                            {insight.priority}
                          </Badge>
                          <div className="flex gap-1">
                            {insight.modules.map((module) => (
                              <Badge key={module} variant="outline" className="text-xs">
                                {module}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <h4 className="font-medium">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {insight.description}
                        </p>
                      </div>
                      {insight.actionable && (
                        <Button size="sm" variant="ghost">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alle smarte innsikter</CardTitle>
            </CardHeader>
            <CardContent>
              {data.insights.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Ingen innsikter tilgjengelig ennå. Legg til eiendommer og leads for å få personlige anbefalinger.
                </p>
              ) : (
                <div className="space-y-4">
                  {data.insights.map((insight) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(insight.priority)}>
                            {insight.priority === 'high' ? 'Høy' : 
                             insight.priority === 'medium' ? 'Medium' : 'Lav'}
                          </Badge>
                          <div className="flex gap-1">
                            {insight.modules.map((module) => (
                              <Badge key={module} variant="outline" className="text-xs">
                                {module === 'property' ? 'Eiendom' :
                                 module === 'leads' ? 'Leads' : 
                                 module === 'sales' ? 'Salg' : module}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {insight.actionable && (
                          <Button size="sm">
                            Handle nå
                          </Button>
                        )}
                      </div>
                      <h4 className="font-medium mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {insight.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nylig aktivitet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recent_activity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString('no-NO')}
                      </p>
                    </div>
                    <Badge variant="outline">{activity.module}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Anbefalinger</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recommendations.map((rec) => (
                  <div key={rec.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={getPriorityColor(rec.priority)}>
                        {rec.priority === 'high' ? 'Høy prioritet' : 
                         rec.priority === 'medium' ? 'Medium prioritet' : 'Lav prioritet'}
                      </Badge>
                    </div>
                    <h4 className="font-medium mb-1">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {rec.description}
                    </p>
                    <Button size="sm" variant="outline">
                      {rec.action === 'view_property_docs' ? 'Se dokumenter' :
                       rec.action === 'start_diy_sale' ? 'Start DIY-salg' : 'Utfør'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};