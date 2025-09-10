import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  Settings
} from 'lucide-react';
import { enhancedPropertyDocumentService, PropertyDocument, MaintenanceTask } from '@/modules/property/api/enhancedDocuments';
import { DocumentUploadDialog } from './DocumentUploadDialog';
import { DocumentGrid } from './DocumentGrid';
import { MaintenanceTaskList } from './MaintenanceTaskList';
import { DocumentSearch } from './DocumentSearch';
import { PropertyDocumentationReport } from './PropertyDocumentationReport';

interface PropertyDocumentationDashboardProps {
  propertyId: string;
}

export const PropertyDocumentationDashboard = ({ propertyId }: PropertyDocumentationDashboardProps) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [searchFilters, setSearchFilters] = useState({});
  const [activeTab, setActiveTab] = useState('documents');

  // Fetch documents
  const { data: documents = [], isLoading: documentsLoading, refetch: refetchDocuments } = useQuery({
    queryKey: ['enhanced-property-documents', propertyId, searchFilters],
    queryFn: () => enhancedPropertyDocumentService.searchDocuments(propertyId, searchFilters),
    enabled: !!propertyId,
  });

  // Fetch maintenance tasks
  const { data: maintenanceTasks = [], refetch: refetchTasks } = useQuery({
    queryKey: ['property-maintenance-tasks', propertyId],
    queryFn: () => enhancedPropertyDocumentService.getMaintenanceTasks(propertyId),
    enabled: !!propertyId,
  });

  // Fetch documentation report
  const { data: report } = useQuery({
    queryKey: ['property-documentation-report', propertyId],
    queryFn: () => enhancedPropertyDocumentService.generateDocumentationReport(propertyId),
    enabled: !!propertyId,
  });

  const handleUploadComplete = () => {
    refetchDocuments();
    setShowUploadDialog(false);
  };

  const handleTaskUpdate = () => {
    refetchTasks();
  };

  const getStatusColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Eiendomsdokumentasjon</h2>
          <p className="text-muted-foreground">
            Administrer dokumenter og vedlikehold for din eiendom
          </p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Last opp dokument
        </Button>
      </div>

      {/* Quick Stats Cards */}
      {report && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Totalt dokumenter</p>
                  <p className="text-2xl font-bold">{report.total_documents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Dokumentasjon</p>
                  <div className="flex items-center space-x-2">
                    <p className={`text-2xl font-bold ${getStatusColor(report.documentation_completeness)}`}>
                      {report.documentation_completeness}%
                    </p>
                  </div>
                  <Progress value={report.documentation_completeness} className="mt-1 h-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Vedlikehold</p>
                  <div className="flex items-center space-x-2">
                    <p className={`text-2xl font-bold ${getStatusColor(report.maintenance_score)}`}>
                      {report.maintenance_score}%
                    </p>
                  </div>
                  <Progress value={report.maintenance_score} className="mt-1 h-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Kategorier</p>
                  <p className="text-2xl font-bold">
                    {report.categories_covered}/{report.total_categories}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Missing Required Documents Alert */}
      {report && report.missing_required_documents.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Manglende påkrevde dokumenter</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Følgende dokumentkategorier mangler:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {report.missing_required_documents.map((docType) => (
                    <Badge key={docType} variant="outline" className="text-yellow-700 border-yellow-300">
                      {docType}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents">Dokumenter</TabsTrigger>
          <TabsTrigger value="maintenance">Vedlikehold</TabsTrigger>
          <TabsTrigger value="reports">Rapporter</TabsTrigger>
          <TabsTrigger value="search">Søk</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <DocumentGrid 
            documents={documents} 
            isLoading={documentsLoading}
            onRefetch={refetchDocuments}
          />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <MaintenanceTaskList 
            propertyId={propertyId}
            tasks={maintenanceTasks}
            onTaskUpdate={handleTaskUpdate}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <PropertyDocumentationReport 
            propertyId={propertyId}
            report={report}
          />
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <DocumentSearch 
            propertyId={propertyId}
            onFiltersChange={setSearchFilters}
          />
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <DocumentUploadDialog
        propertyId={propertyId}
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
};