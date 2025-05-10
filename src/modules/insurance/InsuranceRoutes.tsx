
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CompanyListPage } from './pages/CompanyListPage';
import { CompanyDetailsPage } from './pages/CompanyDetailsPage';

export const InsuranceRoutes = () => {
  return (
    <Routes>
      <Route path="companies" element={<CompanyListPage />} />
      <Route path="companies/:companyId" element={<CompanyDetailsPage />} />
      <Route path="*" element={<Navigate to="companies" replace />} />
    </Routes>
  );
};
