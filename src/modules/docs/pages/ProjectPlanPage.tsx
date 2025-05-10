
import React from 'react';
import { ProjectPlanViewer } from '../components/ProjectPlanViewer';

export const ProjectPlanPage: React.FC = () => {
  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Prosjektplan</h1>
        <p className="text-muted-foreground">
          Overordnet prosjektplan som vedlikeholdes løpende for å reflektere prosjektets status og fremgang.
        </p>
      </div>
      
      <ProjectPlanViewer />
    </div>
  );
};
