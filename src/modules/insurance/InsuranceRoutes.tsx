
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CompanyListPage } from './pages/CompanyListPage';
import { CompanyDetailsPage } from './pages/CompanyDetailsPage';
import { InsuranceQuotePage } from './pages/InsuranceQuotePage';
import { InsuranceComparisonPage } from './pages/InsuranceComparisonPage';

export const InsuranceRoutes = () => {
  return (
    <Routes>
      <Route path="companies" element={<CompanyListPage />} />
      <Route path="companies/:companyId" element={<CompanyDetailsPage />} />
      <Route path="quote" element={<InsuranceQuotePage />} />
      <Route path="compare" element={<InsuranceComparisonPage />} />
      <Route path="*" element={<Navigate to="companies" replace />} />
    </Routes>
  );
};
