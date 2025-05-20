
import React from 'react';
import { Route } from 'react-router-dom';
import { PowerComparisonPage } from '@/pages/PowerComparisonPage';

/**
 * Service-specific routes
 */
export const serviceRoutes = (
  <>
    <Route path="/power-comparison" element={<PowerComparisonPage />} />
    <Route path="/strom" element={<PowerComparisonPage />} />
  </>
);
