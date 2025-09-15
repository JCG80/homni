
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AppProviders } from './app/AppProviders';
import { AuthProvider } from '@/modules/auth/context';
import { ErrorBoundary } from '@/components/system/ErrorBoundary';
import { RouterProvider } from '@/router/RouterProvider';
import { validateEnvironment } from '@/utils/envCheck';
import { log } from '@/utils/logger';

// Bootstrap sequence with proper error handling
const startApp = () => {
  try {
    // Early environment validation
    const envReport = validateEnvironment();
    log.info('🚀 Homni Platform starting...', {
      mode: import.meta.env.MODE,
      environment: envReport,
      timestamp: new Date().toISOString(),
    });

    if (!envReport.ok) {
      log.warn('Environment issues detected:', envReport.missing);
    }
  } catch (error) {
    log.error('Environment validation failed:', {}, error);
    // Continue with degraded functionality
  }
};

// Initialize app
startApp();

// Get root element
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
}

// Create and render app
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider>
        <AuthProvider>
          <AppProviders>
            <App />
          </AppProviders>
        </AuthProvider>
      </RouterProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
