
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import NotFound from '@/pages/NotFound';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { PowerComparisonPage } from '@/pages/PowerComparisonPage';
import { InsuranceQuotePage } from '@/modules/insurance/pages/InsuranceQuotePage';
import { InsuranceRequestSuccessPage } from '@/pages/InsuranceRequestSuccessPage';
import { ServiceSelectionPage } from '@/modules/services/pages/ServiceSelectionPage';
import Index from '@/pages/Index';

/**
 * Main public routes that don't require authentication
 */
export const MainRoutes = () => (
  <>
    <Route path="/" element={<Index />} />
    <Route path="/landing" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/onboarding" element={<OnboardingPage />} />
    <Route path="/unauthorized" element={<UnauthorizedPage />} />
    
    {/* Service comparison routes */}
    <Route path="/strom" element={<PowerComparisonPage />} />
    <Route path="/compare" element={<InsuranceQuotePage />} />
    <Route path="/insurance-request-success" element={<InsuranceRequestSuccessPage />} />
    
    {/* Companies list route */}
    <Route path="/select-services" element={<ServiceSelectionPage />} />
    
    {/* 404 - Not Found */}
    <Route path="*" element={<NotFound />} />
  </>
);
