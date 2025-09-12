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
import { RouterDiagnostics } from '@/components/router/RouterDiagnostics';
import { autoConfigureEnvironment } from '@/utils/environmentDiagnostics';

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
        console.info('App initializing:', {
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

  return (
    <ErrorBoundary>
      <ConnectionStatus />
      <SiteLayout>
        <Shell />
        
        <Toaster />
        <AppDiagnostics />
        <NetworkDiagnostics />
        <RouterDiagnostics />
      </SiteLayout>
    </ErrorBoundary>
  );
}

export default App;