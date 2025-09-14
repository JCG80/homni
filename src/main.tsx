
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { AppProviders } from './app/AppProviders';
import { AuthProvider } from '@/modules/auth/context';
import { GlobalErrorBoundary } from '@/shared/components/GlobalErrorBoundary';
import { validateEnvironment } from '@/utils/envCheck';
import { logger } from '@/utils/logger';

// Bootstrap sequence with proper error handling
const startApp = () => {
  try {
    // Early environment validation
    const envReport = validateEnvironment();
    logger.info('🚀 Homni Platform starting...', {
      mode: import.meta.env.MODE,
      environment: envReport,
      timestamp: new Date().toISOString(),
    });

    if (!envReport.ok) {
      logger.warn('Environment issues detected:', envReport.missing);
    }
  } catch (error) {
    logger.error('Environment validation failed:', {}, error);
    // Continue with degraded functionality
  }
};

// Initialize app
startApp();

// Force HashRouter for Lovable preview environments
const useHashRouter = import.meta.env.VITE_USE_HASHROUTER === 'true' || 
                      window.location.hostname.includes('lovable') || 
                      window.location.hostname.includes('sandbox');
const Router = useHashRouter ? HashRouter : BrowserRouter;

// Get root element
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
}

// Create and render app
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <GlobalErrorBoundary showToast={true} trackErrors={true}>
      <AppProviders>
        <AuthProvider>
          <Router>
            <App />
          </Router>
        </AuthProvider>
      </AppProviders>
    </GlobalErrorBoundary>
  </React.StrictMode>
);
