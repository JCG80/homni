
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { AppProviders } from './app/AppProviders';
import { AuthProvider } from '@/modules/auth/context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { validateEnvironment } from '@/utils/envCheck';

// Log environment and startup details
console.info('🚀 Homni Platform starting...');

// Validate environment early
try {
  const envReport = validateEnvironment();
  console.info('Environment check:', envReport);
} catch (error) {
  console.error('Environment validation failed:', error);
}

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
    <ErrorBoundary>
      <AppProviders>
        <AuthProvider>
          <Router>
            <App />
          </Router>
        </AuthProvider>
      </AppProviders>
    </ErrorBoundary>
  </React.StrictMode>
);
