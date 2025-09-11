import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  DollarSign,
  Home,
  BarChart3,
  Clock
} from 'lucide-react';
import { enhancedPropertyDocumentService } from '@/modules/property/api/enhancedDocuments';
import { formatCurrency, formatDate } from '@/modules/property/utils/propertyUtils';
import { Property } from '@/modules/property/types/propertyTypes';

interface PropertyOverviewProps {
  property: Property;
}

export const PropertyOverview = ({ property }: PropertyOverviewProps) => {
  // Fetch documentation report
  const { data: report } = useQuery({
    queryKey: ['property-documentation-report', property.id],
    queryFn: () => enhancedPropertyDocumentService.generateDocumentationReport(property.id),
    enabled: !!property.id,
  });

  // Fetch maintenance tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['property-maintenance-tasks', property.id],
    queryFn: () => enhancedPropertyDocumentService.getMaintenanceTasks(property.id),
    enabled: !!property.id,
  });

  // Fetch documents
  const { data: documents = [] } = useQuery({
    queryKey: ['property-documents', property.id],
    queryFn: () => enhancedPropertyDocumentService.getPropertyDocuments(property.id),
    enabled: !!property.id,
  });

  // Calculate maintenance stats
  const overdueTasksCount = tasks.filter(task => 
    task.status === 'pending' && 
    task.due_date && 
    new Date(task.due_date) < new Date()
  ).length;

  const upcomingTasksCount = tasks.filter(task => {
    if (!task.due_date || task.status !== 'pending') return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return dueDate >= today && dueDate <= weekFromNow;
  }).length;

  const completedTasksCount = tasks.filter(task => task.status === 'completed').length;

  // Calculate total maintenance costs
  const totalMaintenanceCosts = tasks.reduce((total, task) => 
    total + (task.actual_cost || 0), 0
  );

  const estimatedUpcomingCosts = tasks
    .filter(task => task.status === 'pending')
    .reduce((total, task) => total + (task.estimated_cost || 0), 0);

  // Property age calculation
  const propertyAge = property.purchase_date 
    ? Math.floor((new Date().getTime() - new Date(property.purchase_date).getTime()) / (1000 * 3600 * 24 * 365))
    : null;

  // Recent activity (last 30 days)
  const recentDocuments = documents.filter(doc => {
    const created = new Date(doc.created_at);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return created > thirtyDaysAgo;
  });

  const recentTasks = tasks.filter(task => {
    const created = new Date(task.created_at);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return created > thirtyDaysAgo;
  });

  return (
    <div className="space-y-6">
      {/* Property Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Home className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{property.name}</h1>
                <p className="text-muted-foreground">{property.address}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="outline">{property.type}</Badge>
                  {property.status && (
                    <Badge variant={property.status === 'owned' ? 'default' : 'secondary'}>
                      {property.status}
                    </Badge>
                  )}
                  {propertyAge && (
                    <span className="text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {propertyAge} år gammel
                    </span>
                  )}
                </div>
              </div>
            </div>
            {property.current_value && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Estimert verdi</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(property.current_value)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{documents.length}</p>
                <p className="text-sm text-muted-foreground">Dokumenter</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{tasks.length}</p>
                <p className="text-sm text-muted-foreground">Vedlikehold</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className={`h-5 w-5 ${overdueTasksCount > 0 ? 'text-red-600' : 'text-green-600'}`} />
              <div>
                <p className="text-2xl font-bold">{overdueTasksCount}</p>
                <p className="text-sm text-muted-foreground">Forsinket</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-lg font-bold">{formatCurrency(totalMaintenanceCosts)}</p>
                <p className="text-sm text-muted-foreground">Total vedlikehold</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documentation Score */}
      {report && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Dokumentasjonsoversikt</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Dokumentasjonsgrad</span>
                <span>{report.documentation_completeness}%</span>
              </div>
              <Progress value={report.documentation_completeness} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Vedlikehold score</span>
                <span>{report.maintenance_score}%</span>
              </div>
              <Progress value={report.maintenance_score} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Dokumenter: {report.total_documents}</p>
                <p className="text-muted-foreground">
                  Kategorier: {report.categories_covered}/{report.total_categories}
                </p>
              </div>
              <div>
                <p className="font-medium">Vedlikehold: {report.recent_maintenance_tasks}</p>
                <p className="text-muted-foreground">Siste 6 måneder</p>
              </div>
            </div>

            {report.missing_required_documents.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                <p className="font-medium text-yellow-800 mb-2">Manglende påkrevde dokumenter:</p>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {report.missing_required_documents.map((doc, idx) => (
                    <li key={idx}>• {doc}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Maintenance */}
      {upcomingTasksCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Kommende vedlikehold</span>
              </div>
              <Badge variant="outline">{upcomingTasksCount} oppgaver</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks
                .filter(task => {
                  if (!task.due_date || task.status !== 'pending') return false;
                  const dueDate = new Date(task.due_date);
                  const today = new Date();
                  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                  return dueDate >= today && dueDate <= weekFromNow;
                })
                .slice(0, 3)
                .map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Forfaller: {formatDate(task.due_date)}
                      </p>
                    </div>
                    <Badge variant={
                      task.priority === 'high' ? 'destructive' : 
                      task.priority === 'medium' ? 'default' : 
                      'secondary'
                    }>
                      {task.priority === 'high' ? 'Høy' : 
                       task.priority === 'medium' ? 'Middels' : 'Lav'}
                    </Badge>
                  </div>
                ))}
              {estimatedUpcomingCosts > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    Estimerte kostnader: {formatCurrency(estimatedUpcomingCosts)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {(recentDocuments.length > 0 || recentTasks.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Nylig aktivitet</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDocuments.slice(0, 3).map(doc => (
                <div key={`doc-${doc.id}`} className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Dokument lagt til {formatDate(doc.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              
              {recentTasks.slice(0, 3).map(task => (
                <div key={`task-${task.id}`} className="flex items-center space-x-3">
                  <CheckCircle className={`h-4 w-4 ${
                    task.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Vedlikehold {task.status === 'completed' ? 'fullført' : 'opprettet'} {formatDate(task.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};