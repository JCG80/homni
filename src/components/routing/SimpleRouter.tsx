import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import { AuthPage } from '@/pages/AuthPage';
import DashboardPage from '@/pages/DashboardPage';
import { AdminRolesPage } from '@/pages/admin/AdminRolesPage';

/**
 * SIMPLE ROUTER - INTERNAL ROUTES ONLY
 * Handles dashboard and other internal routes after auth
 */
export const SimpleRouter = () => {
  return (
    <Routes>
      {/* Dashboard and internal routes */}
      <Route path="/dashboard" element={<DashboardPage />} />
      
      {/* Admin routes */}
      <Route path="/admin/roles" element={<AdminRolesPage />} />
      
      {/* Fallback for unmatched routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};