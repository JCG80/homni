import React, { useEffect } from 'react';
import './index.css';
import '@/styles/accessibility.css';
import { SiteLayout } from '@/components/layout/SiteLayout';
import { Toaster } from '@/components/ui/toaster';
import { Shell } from '@/components/layout/Shell';
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
          routerMode: import.meta.env.VITE_ROUTER_MODE || 'browser',
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

  // EMERGENCY: Panic mode - if on login route and everything else fails
  if (window.location.pathname === '/login' || window.location.hash === '#/login') {
    // Import EmergencyLoginFallback dynamically to avoid circular dependencies
    const EmergencyLogin = React.lazy(() => 
      import('@/components/debug/EmergencyLoginFallback').then(module => ({ 
        default: module.EmergencyLoginFallback 
      }))
    );
    
    return (
      <ErrorBoundary>
        <I18nProvider>
          <ConnectionStatus />
          <React.Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Emergency Login Loading...</p>
              </div>
            </div>
          }>
            <EmergencyLogin />
          </React.Suspense>
          <Toaster />
        </I18nProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <I18nProvider>
        <ConnectionStatus />
        <SiteLayout>
          <Shell />
          <ContextualHelp />
          
          <Toaster />
          <DebugToggle />
          <AppDiagnostics />
          <NetworkDiagnostics />
        </SiteLayout>
      </I18nProvider>
    </ErrorBoundary>
  );
}

export default App;