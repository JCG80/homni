import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '@/pages/HomePage';

/**
 * SIMPLE ROUTER - MINIMAL ROUTES WITHOUT COMPLEX FILTERING
 * Handles only critical routes to ensure they always work
 */
export const SimpleRouter = () => {
  return (
    <Routes>
      {/* Critical routes that must always work */}
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="/" element={<HomePage />} />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};