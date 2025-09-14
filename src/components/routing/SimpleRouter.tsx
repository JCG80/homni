import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DirectLoginPage } from '@/components/direct/DirectLoginPage';
import HomePage from '@/pages/HomePage';

/**
 * SIMPLE ROUTER - MINIMAL ROUTES WITHOUT COMPLEX FILTERING
 * Handles only critical routes to ensure they always work
 */
export const SimpleRouter = () => {
  console.log('[SIMPLE ROUTER] Rendering minimal route structure');

  return (
    <Routes>
      {/* Critical routes that must always work */}
      <Route path="/login" element={<DirectLoginPage />} />
      <Route path="/" element={<HomePage />} />
      
      {/* Fallback route */}
      <Route path="*" element={<DirectLoginPage />} />
    </Routes>
  );
};