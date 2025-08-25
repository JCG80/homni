
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { useProjectPlan } from '../hooks/useProjectPlan';
import { MarkdownViewer } from './MarkdownViewer';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/modules/auth/hooks';
import { ProjectPlanEditor } from './ProjectPlanEditor';
import { Badge } from '@/components/ui/badge';

export const ProjectPlanViewer: React.FC = () => {
  const { projectPlan, isLoading, isEditing, setIsEditing, updateProjectPlan } = useProjectPlan();
  const { role } = useAuth();
  
  const isAdmin = role === 'admin' || role === 'master_admin';
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle><Skeleton className="h-8 w-1/3" /></CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-5/6 mb-2" />
          <Skeleton className="h-4 w-2/3 mb-2" />
        </CardContent>
      </Card>
    );
  }
  
  if (!projectPlan) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Prosjektplan ikke funnet</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Prosjektplanen er ikke tilgjengelig for øyeblikket.</p>
        </CardContent>
      </Card>
    );
  }
  
  if (isEditing) {
    return (
      <ProjectPlanEditor 
        initialContent={projectPlan.content}
        onSave={async (content) => {
          await updateProjectPlan(content);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-3">
            {projectPlan.title}
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Oppdatert: {new Date(projectPlan.updated_at).toLocaleDateString('nb-NO')}
            </Badge>
          </CardTitle>
          <div className="mt-2 flex gap-2">
            <Badge variant="secondary">Fase 12</Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Service Selection Module</Badge>
          </div>
        </div>
        {isAdmin && (
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto" 
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Rediger
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <h3 className="font-semibold text-amber-800">Nåværende fokus</h3>
          <p className="text-amber-700 mt-1">
            Implementering av servicevalgmodulen for brukerpreferanser og lead-generering.
            Prioritet: Høy
          </p>
        </div>
        <MarkdownViewer content={projectPlan.content} />
      </CardContent>
    </Card>
  );
};
