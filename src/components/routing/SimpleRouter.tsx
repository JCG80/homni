import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import { AuthPage } from '@/pages/AuthPage';
import DashboardPage from '@/pages/DashboardPage';

/**
 * SIMPLE ROUTER - OPTIMIZED FOR LOVABLE SANDBOX
 * Handles all critical routes without complex filtering
 */
export const SimpleRouter = () => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      
      {/* Main routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};