
import React from 'react';
import { Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/modules/auth/pages/RegisterPage';
import NotFound from '@/pages/NotFound';
import { UnauthorizedPage } from '@/modules/auth/pages/UnauthorizedPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { DesignSystemPage } from '@/pages/DesignSystemPage';
import { ServiceSelectionPage } from '@/modules/services/pages/ServiceSelectionPage';
import { PropertyPurchasePage } from '@/pages/PropertyPurchasePage';
import { AnonymousLeadsPage } from '@/pages/AnonymousLeadsPage';

/**
 * Main public routes available to all users
 */
export const mainRoutes = (
  <>
    {/* Public routes */}
    <Route path="/" element={<HomePage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/onboarding" element={<OnboardingPage />} />
    <Route path="/unauthorized" element={<UnauthorizedPage />} />
    <Route path="*" element={<NotFound />} />
    
    {/* Design System Page */}
    <Route path="/design-system" element={<DesignSystemPage />} />
    
    {/* Service Selection */}
    <Route path="/select-services" element={<ServiceSelectionPage />} />
    
    {/* Anonymous Lead Viewer */}
    <Route path="/mine-foresporsler" element={<AnonymousLeadsPage />} />
    
    {/* Property Services */}
    <Route path="/boligkjop" element={<PropertyPurchasePage />} />
  </>
);
