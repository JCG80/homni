import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { propertyManagementService } from '../services/propertyManagementService';
import { MaintenanceTask, PropertyDocument } from '../types/propertyTypes';

export const PropertyManagementInterface = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadData = async () => {
    setIsLoading(true);
    try {
      const [tasksData, docsData] = await Promise.all([
        propertyManagementService.getMaintenanceTasks('test-property-id'),
        propertyManagementService.getPropertyDocuments('test-property-id')
      ]);
      setTasks(tasksData);
      setDocuments(docsData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Eiendomsadministrasjon</CardTitle>
          <CardDescription>
            Administrer eiendomsdokumenter og vedlikehold (Boligmappa.no stil)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLoadData} disabled={isLoading}>
            {isLoading ? 'Laster...' : 'Last inn data'}
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="maintenance" className="w-full">
        <TabsList>
          <TabsTrigger value="maintenance">Vedlikehold</TabsTrigger>
          <TabsTrigger value="documents">Dokumenter</TabsTrigger>
        </TabsList>
        
        <TabsContent value="maintenance">
          <div className="grid gap-4">
            {tasks.map((task) => (
              <Card key={task.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <Badge variant={task.priority === 'high' ? 'destructive' : 'default'}>
                      {task.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {task.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      Frist: {new Date(task.dueDate).toLocaleDateString('no')}
                    </span>
                    <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                      {task.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="documents">
          <div className="grid gap-4">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{doc.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {doc.documentType}
                    </span>
                    <span className="text-sm">
                      {new Date(doc.uploadedAt).toLocaleDateString('no')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};