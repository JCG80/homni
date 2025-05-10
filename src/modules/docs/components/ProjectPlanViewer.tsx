
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { useProjectPlan } from '../hooks/useProjectPlan';
import { MarkdownViewer } from './MarkdownViewer';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { ProjectPlanEditor } from './ProjectPlanEditor';

export const ProjectPlanViewer: React.FC = () => {
  const { projectPlan, isLoading, isEditing, setIsEditing, updateProjectPlan } = useProjectPlan();
  const { role } = useAuth();
  
  const isAdmin = role === 'admin' || role === 'master-admin';
  
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
        <CardTitle>{projectPlan.title}</CardTitle>
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
        <MarkdownViewer content={projectPlan.content} />
      </CardContent>
    </Card>
  );
};
