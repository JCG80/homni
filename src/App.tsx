import React from 'react';
import './index.css';
import '@/styles/accessibility.css';
import { SiteLayout } from '@/components/layout/SiteLayout';
import { Toaster } from '@/components/ui/toaster';
import { Shell } from '@/components/layout/Shell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ConnectionStatus } from '@/components/loading/UniversalLoadingStates';
import { RouterDebugInfo } from '@/components/debug/RouterDebugInfo';
import { usePageViews } from '@/lib/analytics/react';

function App() {
  usePageViews(); // auto-track SPA navigation

  return (
    <ErrorBoundary>
      <ConnectionStatus />
      <SiteLayout>
        <Shell />
        <RouterDebugInfo />
        <Toaster />
      </SiteLayout>
    </ErrorBoundary>
  );
}

export default App;