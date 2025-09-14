import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import '@/styles/accessibility.css';
import { SiteLayout } from '@/components/layout/SiteLayout';
import { Toaster } from '@/components/ui/toaster';
import { ConnectionStatus } from '@/components/loading/UniversalLoadingStates';
import { stripLovableToken, hasLovableToken } from '@/app/stripToken';
import { performDevCleanup } from '@/pwa/cleanup';
import { AppDiagnostics } from '@/components/debug/AppDiagnostics';
import { NetworkDiagnostics } from '@/components/debug/NetworkDiagnostics';
import { DebugToggle } from '@/components/debug/DebugToggle';
import { autoConfigureEnvironment } from '@/utils/environmentDiagnostics';
import { RouteErrorBoundary } from '@/components/error/RouteErrorBoundary';
import { log } from '@/utils/logger';
// Import i18n configuration
import '@/lib/i18n/index';
import { ContextualHelp } from '@/components/guidance/ContextualHelp';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { DegradedModeBanner } from '@/components/ui/DegradedModeBanner';
import { SimpleRouter } from '@/components/routing/SimpleRouter';
import { AuthPage } from '@/pages/AuthPage';
import { ApiStatusBanner } from '@/components/ApiStatusBanner';
import { EnvironmentChecker } from '@/components/EnvironmentChecker';
import { SystemStatusBanner } from '@/shared/components/SystemStatusBanner';
import NotFound from '@/components/system/NotFound';

import { usePageViews } from '@/lib/analytics/react';

import HomePage from '@/pages/HomePage';

function App() {
  try {
    usePageViews(); // auto-track SPA navigation
  } catch (error) {
    log.error('[APP] usePageViews failed:', error);
  }

  // Initialize app cleanup on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Auto-configure environment
        autoConfigureEnvironment();
        
        // Log initial state for debugging
        if (import.meta.env.DEV) {
          log.info('App initializing:', {
            hasToken: hasLovableToken(),
            hostname: window.location.hostname
          });
        }
        
        // Clean up lovable token from URL
        stripLovableToken();
        
        // Perform dev/preview cleanup
        await performDevCleanup();
      } catch (error) {
        log.error('[APP] App initialization failed:', error);
      }
    };
    
    initializeApp();
  }, []);

  return (
    <I18nProvider>
      <SystemStatusBanner />
      <EnvironmentChecker />
      <ConnectionStatus />
      <ApiStatusBanner />
      <DegradedModeBanner />
      <Routes>
        <Route path="/auth" element={<RouteErrorBoundary routeName="Autentisering"><AuthPage /></RouteErrorBoundary>} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/" element={<RouteErrorBoundary routeName="Forside"><HomePage /></RouteErrorBoundary>} />
        <Route path="/*" element={
          <SiteLayout>
            <RouteErrorBoundary routeName="Applikasjon">
              <SimpleRouter />
            </RouteErrorBoundary>
            <ContextualHelp />
            <DebugToggle />
            <AppDiagnostics />
            <NetworkDiagnostics />
          </SiteLayout>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </I18nProvider>
  );
}

export default App;