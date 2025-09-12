import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/modules/auth/hooks';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import { useLazyModules } from '@/hooks/useLazyModules';
import { getNavigation } from '@/config/navigation-consolidated';
import { UserRole } from '@/modules/auth/normalizeRole';
import { SearchProgress } from './components/SearchProgress';
import { RoleAdaptiveContent } from './components/RoleAdaptiveContent';
import { useSmartStartFlow } from './hooks/useSmartStartFlow';
import { VisitorWizard } from '@/components/landing/VisitorWizard';

export const SmartStart = () => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const { isEnabled: smartStartEnabled } = useFeatureFlag('ENABLE_SMART_START');
  const { preloadModules, getAvailableModules } = useLazyModules(role as UserRole);
  const {
    searchQuery,
    searchStep,
    isSearching,
    searchResults,
    handleSearch,
    handleStepComplete,
    resetFlow
  } = useSmartStartFlow();

  // Preload relevant modules for the user's role
  useEffect(() => {
    if (role) {
      preloadModules();
    }
  }, [role, preloadModules]);

  // Fallback to VisitorWizard if SmartStart is not enabled
  if (!smartStartEnabled) {
    return <VisitorWizard />;
  }

  // Show loading state while auth is resolving
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navigationItems = getNavigation(role as UserRole || 'guest');
  const availableModules = getAvailableModules();

  return (
    <>
      <Helmet>
        <title>Homni - Smart søk etter tjenester på 3 enkle steg</title>
        <meta name="description" content="Finn og sammenlign leverandører med vår smarte søkefunksjon. Perfekt tilpasset dine behov - privat eller bedrift." />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Smart søk etter{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                perfekte tjenester
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {isAuthenticated 
                ? `Velkommen tilbake! La oss finne de beste løsningene for deg.`
                : 'Finn og sammenlign leverandører på 3 enkle steg. Helt gratis og uforpliktende.'
              }
            </p>
          </motion.div>

          {/* Search Progress Indicator */}
          <SearchProgress 
            currentStep={searchStep}
            isSearching={isSearching}
            query={searchQuery}
          />

          {/* Role-Adaptive Content */}
          <AnimatePresence mode="wait">
            <RoleAdaptiveContent
              key={`${role}-${searchStep}`}
              role={(role as UserRole) || 'guest'}
              isAuthenticated={isAuthenticated}
              searchStep={searchStep}
              searchQuery={searchQuery}
              searchResults={searchResults}
              availableModules={availableModules}
              navigationItems={navigationItems}
              onSearch={handleSearch}
              onStepComplete={handleStepComplete}
              onReset={resetFlow}
            />
          </AnimatePresence>
        </div>
      </main>
    </>
  );
};