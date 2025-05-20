
import React from 'react';
import { Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../modules/auth/pages/LoginPage';
import { RegisterPage } from '../modules/auth/pages/RegisterPage';
import NotFound from '../pages/NotFound';
import { UnauthorizedPage } from '../modules/auth/pages/UnauthorizedPage';
import { OnboardingPage } from '../pages/OnboardingPage';

/**
 * Main routes collection - not used directly in Routes component
 * This file acts as a reference for available main routes and should be
 * incorporated directly into AppRouteComponents
 */
export const MainRoutes = () => {
  return (
    <>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFound />} />
    </>
  );
};
