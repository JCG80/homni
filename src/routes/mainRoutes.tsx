
import React from 'react';
import { Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/modules/auth/pages/RegisterPage';
import NotFound from '@/pages/NotFound';
import { UnauthorizedPage } from '@/modules/auth/pages/UnauthorizedPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { DesignSystemPage } from '@/pages/DesignSystemPage';
import { ServiceSelectionPage } from '@/modules/services/pages/ServiceSelectionPage';

/**
 * Main public routes available to all users
 */
export const mainRoutes = (
  <>
    {/* Public routes */}
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/onboarding" element={<OnboardingPage />} />
    <Route path="/unauthorized" element={<UnauthorizedPage />} />
    <Route path="*" element={<NotFound />} />
    
    {/* Design System Page */}
    <Route path="/design-system" element={<DesignSystemPage />} />
    
    {/* Service Selection */}
    <Route path="/select-services" element={<ServiceSelectionPage />} />
  </>
);
