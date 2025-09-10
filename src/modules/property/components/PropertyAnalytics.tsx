import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

export function PropertyAnalytics() {
  const { user } = useAuth();

  const { data: analytics } = useQuery({
    queryKey: ['property-analytics', user?.id],
    queryFn: async () => {
      // Get property completion scores
      const { data: properties } = await supabase
        .from('properties')
        .select('id, name, type, size, address, purchase_date')
        .eq('user_id', user?.id);

      if (!properties?.length) return null;

      // Calculate documentation completeness
      const { data: documents } = await supabase
        .from('property_documents')
        .select('property_id, document_type')
        .in('property_id', properties.map(p => p.id));

      // Get maintenance status
      const { data: maintenanceTasks } = await supabase
        .from('property_maintenance_tasks')
        .select('property_id, status, priority, due_date')
        .in('property_id', properties.map(p => p.id));

      // Calculate analytics
      const propertyAnalytics = properties.map(property => {
        const propertyDocs = documents?.filter(d => d.property_id === property.id) || [];
        const propertyTasks = maintenanceTasks?.filter(t => t.property_id === property.id) || [];
        
        // Basic completion score
        let completionScore = 0;
        if (property.address) completionScore += 20;
        if (property.size) completionScore += 20;
        if (property.purchase_date) completionScore += 20;
        if (propertyDocs.length > 0) completionScore += 20;
        if (propertyTasks.length === 0) completionScore += 20; // No pending tasks = good

        // Maintenance status
        const overdueTasks = propertyTasks.filter(t => 
          t.status === 'pending' && 
          new Date(t.due_date) < new Date()
        ).length;

        const highPriorityTasks = propertyTasks.filter(t => 
          t.status === 'pending' && 
          t.priority === 'high'
        ).length;

        return {
          property,
          completionScore,
          documentCount: propertyDocs.length,
          taskCount: propertyTasks.length,
          overdueTasks,
          highPriorityTasks
        };
      });

      // Overall metrics
      const avgCompletionScore = propertyAnalytics.reduce((sum, p) => sum + p.completionScore, 0) / propertyAnalytics.length;
      const totalOverdueTasks = propertyAnalytics.reduce((sum, p) => sum + p.overdueTasks, 0);
      const totalDocuments = propertyAnalytics.reduce((sum, p) => sum + p.documentCount, 0);
      const wellMaintainedProperties = propertyAnalytics.filter(p => p.completionScore >= 80).length;

      return {
        properties: propertyAnalytics,
        avgCompletionScore,
        totalOverdueTasks,
        totalDocuments,
        wellMaintainedProperties,
        improvementOpportunities: propertyAnalytics.filter(p => p.completionScore < 60).length
      };
    },
    enabled: !!user?.id
  });

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Eiendommanalyse</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Ingen data tilgjengelig</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Eiendommanalyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-fulloreground">Gjennomsnittlig komplettering</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{Math.round(analytics.avgCompletionScore)}%</p>
                {analytics.avgCompletionScore >= 70 ? 
                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                }
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Forfalt vedlikehold</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-red-600">{analytics.totalOverdueTasks}</p>
                {analytics.totalOverdueTasks > 0 && <AlertCircle className="h-4 w-4 text-red-500" />}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Totale dokumenter</p>
              <p className="text-2xl font-bold">{analytics.totalDocuments}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Godt vedlikeholdt</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-green-600">{analytics.wellMaintainedProperties}</p>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {analytics.improvementOpportunities > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="h-5 w-5" />
              Forbedringsmuligheter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {analytics.improvementOpportunities} eiendomm{analytics.improvementOpportunities === 1 ? '' : 'er'} 
              {' '}kan forbedres ved å legge til manglende informasjon eller dokumenter.
            </p>
            <div className="space-y-2">
              {analytics.properties
                .filter(p => p.completionScore < 60)
                .slice(0, 3)
                .map(({ property, completionScore }) => (
                  <div key={property.id} className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <span className="font-medium">{property.name}</span>
                    <span className="text-sm text-yellow-600">{completionScore}% komplett</span>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}