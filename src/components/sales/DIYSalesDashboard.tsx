import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalesProcessFlow } from './SalesProcessFlow';
import { SalesDocuments } from './SalesDocuments';
import { SalesProgress } from './SalesProgress';
import { Home, FileText, BarChart3, Plus } from 'lucide-react';

interface SalesProject {
  id: string;
  propertyAddress: string;
  currentStep: number;
  totalSteps: number;
  status: 'draft' | 'active' | 'completed' | 'paused';
  createdAt: string;
  estimatedCompletion?: string;
}

export function DIYSalesDashboard() {
  const [activeProjects] = useState<SalesProject[]>([
    {
      id: '1',
      propertyAddress: 'Storgata 123, Oslo',
      currentStep: 3,
      totalSteps: 8,
      status: 'active',
      createdAt: '2024-01-15',
      estimatedCompletion: '2024-03-01'
    },
    {
      id: '2', 
      propertyAddress: 'Fjellveien 45, Bergen',
      currentStep: 1,
      totalSteps: 8,
      status: 'draft',
      createdAt: '2024-01-20'
    }
  ]);

  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  if (selectedProject) {
    const project = activeProjects.find(p => p.id === selectedProject);
    if (project) {
      return (
        <div className="space-y-6">
          <DIYSalesProjectView 
            project={project} 
            onBack={() => setSelectedProject(null)} 
          />
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">DIY Boligsalg</h1>
          <p className="text-muted-foreground">
            Selg boligen din selv med vår trinn-for-trinn guide
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Start nytt salg
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive salg</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.filter(p => p.status === 'active').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dokumenter</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gjennomføring</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67%</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Mine salgsprosjekter</h2>
        
        {activeProjects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Ingen aktive salg</h3>
              <p className="text-muted-foreground mb-4">
                Start ditt første DIY boligsalg for å komme i gang
              </p>
              <Button>Start nytt salg</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {activeProjects.map((project) => (
              <Card key={project.id} className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setSelectedProject(project.id)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{project.propertyAddress}</CardTitle>
                      <CardDescription>
                        Startet {new Date(project.createdAt).toLocaleDateString('no-NO')}
                      </CardDescription>
                    </div>
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                      {project.status === 'active' ? 'Aktiv' : 
                       project.status === 'draft' ? 'Utkast' : 
                       project.status === 'completed' ? 'Fullført' : 'Pauset'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Fremgang</span>
                      <span>{project.currentStep} av {project.totalSteps} trinn</span>
                    </div>
                    <Progress value={(project.currentStep / project.totalSteps) * 100} />
                    {project.estimatedCompletion && (
                      <p className="text-sm text-muted-foreground">
                        Estimert ferdig: {new Date(project.estimatedCompletion).toLocaleDateString('no-NO')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface DIYSalesProjectViewProps {
  project: SalesProject;
  onBack: () => void;
}

function DIYSalesProjectView({ project, onBack }: DIYSalesProjectViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            ← Tilbake til oversikt
          </Button>
          <h1 className="text-3xl font-bold">{project.propertyAddress}</h1>
          <p className="text-muted-foreground">
            DIY Boligsalg - Trinn {project.currentStep} av {project.totalSteps}
          </p>
        </div>
        <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="text-sm">
          {project.status === 'active' ? 'Aktiv' : 
           project.status === 'draft' ? 'Utkast' : 
           project.status === 'completed' ? 'Fullført' : 'Pauset'}
        </Badge>
      </div>

      <Tabs defaultValue="process" className="space-y-4">
        <TabsList>
          <TabsTrigger value="process">Salgsprosess</TabsTrigger>
          <TabsTrigger value="documents">Dokumenter</TabsTrigger>
          <TabsTrigger value="progress">Fremgang</TabsTrigger>
        </TabsList>

        <TabsContent value="process">
          <SalesProcessFlow 
            currentStep={project.currentStep}
            totalSteps={project.totalSteps}
            projectId={project.id}
          />
        </TabsContent>

        <TabsContent value="documents">
          <SalesDocuments projectId={project.id} />
        </TabsContent>

        <TabsContent value="progress">
          <SalesProgress 
            project={project}
            currentStep={project.currentStep}
            totalSteps={project.totalSteps}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}