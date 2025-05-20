
import React from 'react';
import { Route } from 'react-router-dom';
import { ProjectPlanPage } from '../modules/docs/pages/ProjectPlanPage';
import { FAQPage } from '../modules/docs/pages/FAQPage';

export const DocsRoutes = () => {
  return (
    <>
      <Route path="/docs/project-plan" element={<ProjectPlanPage />} />
      <Route path="/docs/faq" element={<FAQPage />} />
    </>
  );
};
