import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  House, 
  Calendar, 
  ArrowRight, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  MapPin,
  Ruler
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Property } from '../types/propertyTypes';
import { formatDate, getPropertyTypeLabel } from '../utils/propertyUtils';

interface EnhancedPropertyCardProps {
  property: Property;
}

export const EnhancedPropertyCard = ({ property }: EnhancedPropertyCardProps) => {
  const navigate = useNavigate();
  
  // Fetch property completeness data
  const { data: completenessData } = useQuery({
    queryKey: ['property-completeness', property.id],
    queryFn: async () => {
      // Get documents count
      const { data: documents } = await supabase
        .from('property_documents')
        .select('id', { count: 'exact' })
        .eq('property_id', property.id);

      // Get maintenance tasks
      const { data: tasks } = await supabase
        .from('property_maintenance_tasks')
        .select('id, status, priority, due_date')
        .eq('property_id', property.id);

      // Calculate completeness score
      let completenessScore = 0;
      if (property.address) completenessScore += 25;
      if (property.size) completenessScore += 25;
      if (property.purchase_date) completenessScore += 25;
      if ((documents?.length || 0) > 0) completenessScore += 25;

      // Check maintenance status
      const overdueTasks = tasks?.filter(t => 
        t.status === 'pending' && 
        t.due_date && 
        new Date(t.due_date) < new Date()
      ) || [];

      const highPriorityTasks = tasks?.filter(t => 
        t.status === 'pending' && 
        t.priority === 'high'
      ) || [];

      return {
        completenessScore,
        documentsCount: documents?.length || 0,
        tasksCount: tasks?.length || 0,
        overdueTasks: overdueTasks.length,
        highPriorityTasks: highPriorityTasks.length,
        hasIssues: overdueTasks.length > 0 || highPriorityTasks.length > 0
      };
    }
  });

  const handleViewDetails = () => {
    navigate(`/properties/${property.id}`);
  };

  const getCompletenessColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletenessLabel = (score: number) => {
    if (score >= 75) return 'Komplett';
    if (score >= 50) return 'Delvis';
    return 'Mangler info';
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <House className="h-4 w-4 text-primary" />
            </div>
            <Badge variant="outline" className="font-normal">
              {getPropertyTypeLabel(property.type)}
            </Badge>
          </div>
          
          {completenessData?.hasIssues && (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
        </div>
        
        <CardTitle className="text-lg group-hover:text-primary transition-colors">
          {property.name}
        </CardTitle>
        
        {property.address && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {property.address}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow space-y-4">
        {/* Property details */}
        <div className="space-y-2">
          {property.size && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Ruler className="h-3 w-3" />
                Størrelse
              </div>
              <span className="font-medium">{property.size} m²</span>
            </div>
          )}
          
          {property.purchase_date && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Kjøpt
              </div>
              <span>{formatDate(property.purchase_date)}</span>
            </div>
          )}
        </div>

        {/* Completeness and status */}
        {completenessData && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Komplettering</span>
                <span className={getCompletenessColor(completenessData.completenessScore)}>
                  {completenessData.completenessScore}%
                </span>
              </div>
              <Progress 
                value={completenessData.completenessScore} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {getCompletenessLabel(completenessData.completenessScore)}
              </p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3 text-muted-foreground" />
                <span>{completenessData.documentsCount} dok.</span>
              </div>
              
              <div className="flex items-center gap-1">
                {completenessData.hasIssues ? (
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                ) : (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                )}
                <span>{completenessData.tasksCount} oppg.</span>
              </div>
            </div>

            {/* Alerts */}
            {completenessData.overdueTasks > 0 && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                <p className="text-xs text-red-800 dark:text-red-200">
                  {completenessData.overdueTasks} forfalt vedlikehold
                </p>
              </div>
            )}
            
            {completenessData.highPriorityTasks > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  {completenessData.highPriorityTasks} høy prioritet oppgaver
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {/* Action button */}
      <div className="p-4 pt-0">
        <Button 
          variant="outline" 
          className="w-full group-hover:border-primary group-hover:text-primary transition-colors" 
          onClick={handleViewDetails}
        >
          <span>Se detaljer</span>
          <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  );
};