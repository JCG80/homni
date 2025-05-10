
import React from 'react';
import { Route } from 'react-router-dom';
import { ProjectPlanPage } from './pages/ProjectPlanPage';

export const docsRoutes = (
  <>
    <Route path="/docs/project-plan" element={<ProjectPlanPage />} />
  </>
);
