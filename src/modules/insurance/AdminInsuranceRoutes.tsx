
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminInsuranceCompaniesPage } from './pages/AdminInsuranceCompaniesPage';
import { AdminInsuranceTypesPage } from './pages/AdminInsuranceTypesPage';
import { AdminCompanyTypesPage } from './pages/AdminCompanyTypesPage';
import { AdminDetachedBuildingsPage } from './pages/AdminDetachedBuildingsPage';

export const AdminInsuranceRoutes = () => {
  return (
    <Routes>
      <Route path="companies" element={<AdminInsuranceCompaniesPage />} />
      <Route path="types" element={<AdminInsuranceTypesPage />} />
      <Route path="companies/:companyId/types" element={<AdminCompanyTypesPage />} />
      <Route path="buildings" element={<AdminDetachedBuildingsPage />} />
      <Route path="*" element={<Navigate to="companies" replace />} />
    </Routes>
  );
};
