
import React from 'react';
import { Route } from 'react-router-dom';
import { ProjectPlanPage } from './pages/ProjectPlanPage';
import { FAQPage } from './pages/FAQPage';

export const docsRoutes = (
  <>
    <Route path="/docs/project-plan" element={<ProjectPlanPage />} />
    <Route path="/docs/faq" element={<FAQPage />} />
  </>
);
