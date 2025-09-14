import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import '@/styles/accessibility.css';
import { SiteLayout } from '@/components/layout/SiteLayout';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ConnectionStatus } from '@/components/loading/UniversalLoadingStates';
import { stripLovableToken, hasLovableToken } from '@/app/stripToken';
import { performDevCleanup } from '@/pwa/cleanup';
import { AppDiagnostics } from '@/components/debug/AppDiagnostics';
import { NetworkDiagnostics } from '@/components/debug/NetworkDiagnostics';
import { DebugToggle } from '@/components/debug/DebugToggle';
import { autoConfigureEnvironment } from '@/utils/environmentDiagnostics';
import { logger } from '@/utils/logger';
// Import i18n configuration
import '@/lib/i18n/index';
import { ContextualHelp } from '@/components/guidance/ContextualHelp';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { SimpleRouter } from '@/components/routing/SimpleRouter';
import { DirectLoginPage } from '@/components/direct/DirectLoginPage';
import { ApiStatusBanner } from '@/components/ApiStatusBanner';
import { EnvironmentChecker } from '@/components/EnvironmentChecker';

import { usePageViews } from '@/lib/analytics/react';

function App() {
  usePageViews(); // auto-track SPA navigation

  // Initialize app cleanup on mount
  useEffect(() => {
    const initializeApp = async () => {
      // Auto-configure environment
      autoConfigureEnvironment();
      
      // Log initial state for debugging
      if (import.meta.env.DEV) {
        logger.info('App initializing:', {
          hasToken: hasLovableToken(),
          useHashRouter: import.meta.env.VITE_USE_HASHROUTER,
          hostname: window.location.hostname
        });
      }
      
      // Clean up lovable token from URL
      stripLovableToken();
      
      // Perform dev/preview cleanup
      await performDevCleanup();
    };
    
    initializeApp();
  }, []);

  return (
    <ErrorBoundary>
      <I18nProvider>
        <EnvironmentChecker />
        <ConnectionStatus />
        <ApiStatusBanner />
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
          <Routes>
            <Route path="/login" element={<DirectLoginPage />} />
            <Route path="/*" element={
              <SiteLayout>
                <SimpleRouter />
                <ContextualHelp />
                <DebugToggle />
                <AppDiagnostics />
                <NetworkDiagnostics />
              </SiteLayout>
            } />
          </Routes>
        </Suspense>
        <Toaster />
      </I18nProvider>
    </ErrorBoundary>
  );
}

export default App;