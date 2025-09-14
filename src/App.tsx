import React, { useEffect } from 'react';
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
import { RouteErrorBoundary } from '@/components/error/RouteErrorBoundary';
import { logger } from '@/utils/logger';
// Import i18n configuration
import '@/lib/i18n/index';
import { ContextualHelp } from '@/components/guidance/ContextualHelp';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { SimpleRouter } from '@/components/routing/SimpleRouter';
import { AuthPage } from '@/pages/AuthPage';
import { ApiStatusBanner } from '@/components/ApiStatusBanner';
import { EnvironmentChecker } from '@/components/EnvironmentChecker';

import { usePageViews } from '@/lib/analytics/react';

import HomePage from '@/pages/HomePage';

console.log('[APP] App component initializing...');

function App() {
  console.log('[APP] App function called, starting usePageViews...');
  try {
    usePageViews(); // auto-track SPA navigation
    console.log('[APP] usePageViews completed successfully');
  } catch (error) {
    console.error('[APP] usePageViews failed:', error);
  }

  // Initialize app cleanup on mount
  useEffect(() => {
    console.log('[APP] useEffect starting...');
    const initializeApp = async () => {
      try {
        console.log('[APP] Initializing app...');
        // Auto-configure environment
        autoConfigureEnvironment();
        console.log('[APP] Environment configured');
        
        // Force HashRouter for Lovable environments
        const forceHashRouter = window.location.hostname.includes('lovable') || 
                                window.location.hostname.includes('sandbox') ||
                                import.meta.env.VITE_USE_HASHROUTER === 'true';
        
        console.log('[APP] Router config - forceHashRouter:', forceHashRouter);
        
        // Log initial state for debugging
        if (import.meta.env.DEV) {
          logger.info('App initializing:', {
            hasToken: hasLovableToken(),
            forceHashRouter,
            hostname: window.location.hostname
          });
        }
        
        // Clean up lovable token from URL
        stripLovableToken();
        console.log('[APP] Token stripped');
        
        // Perform dev/preview cleanup
        await performDevCleanup();
        console.log('[APP] Dev cleanup completed');
      } catch (error) {
        console.error('[APP] App initialization failed:', error);
      }
    };
    
    initializeApp();
  }, []);

  return (
    <ErrorBoundary>
      <I18nProvider>
        <EnvironmentChecker />
        <ConnectionStatus />
        <ApiStatusBanner />
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
        </Routes>
        <Toaster />
      </I18nProvider>
    </ErrorBoundary>
  );
}

export default App;