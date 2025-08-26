import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LeadsOffersDashboard } from '@/components/dashboard/LeadsOffersDashboard';

export const DashboardRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LeadsOffersDashboard />} />
      <Route path="/leads" element={<LeadsOffersDashboard />} />
    </Routes>
  );
};