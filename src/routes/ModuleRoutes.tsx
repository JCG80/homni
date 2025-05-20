
import React from 'react';
import { Route } from 'react-router-dom';
import { ServiceSelectionPage } from '../modules/services/pages/ServiceSelectionPage';
import { CompanyListPage } from '../modules/user/pages/CompanyListPage';
import { PowerComparisonPage } from '../pages/PowerComparisonPage';

export const ModuleRoutes = () => {
  return (
    <>
      <Route path="/select-services" element={<ServiceSelectionPage />} />
      <Route path="/companies" element={<CompanyListPage />} />
      <Route path="/power-comparison" element={<PowerComparisonPage />} />
    </>
  );
};
