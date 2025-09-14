
// DEBUGGING: Testing minimal imports to isolate the issue
console.log('[MAIN] Testing import: React');
import React from 'react';
console.log('[MAIN] ✅ React imported');

console.log('[MAIN] Testing import: createRoot');
import { createRoot } from 'react-dom/client';
console.log('[MAIN] ✅ createRoot imported');

console.log('[MAIN] Testing import: router');
import { BrowserRouter, HashRouter } from 'react-router-dom';
console.log('[MAIN] ✅ Router imported');

console.log('[MAIN] Testing import: index.css');
import './index.css';
console.log('[MAIN] ✅ CSS imported');

console.log('[MAIN] Testing import: App');
import App from './App.tsx';
console.log('[MAIN] ✅ App imported');

console.log('[MAIN] Testing import: AppProviders');
import { AppProviders } from './app/AppProviders';
console.log('[MAIN] ✅ AppProviders imported');

console.log('[MAIN] Testing import: AuthProvider - THIS MIGHT FAIL');
import { AuthProvider } from '@/modules/auth/context';
console.log('[MAIN] ✅ AuthProvider imported');

console.log('[MAIN] Testing import: apiStatus');
import { validateEnvironment } from '@/utils/envCheck';
console.log('[MAIN] ✅ All imports successful');

// Add debugging logs to understand what's happening
console.log('[MAIN] Starting app initialization');
console.log('[MAIN] Hostname:', window.location.hostname);
console.log('[MAIN] Environment:', import.meta.env.MODE);
console.log('[MAIN] Base URL:', import.meta.env.BASE_URL);
console.log('[MAIN] User Agent:', navigator.userAgent);

// Test module health before proceeding
import { checkModuleHealth } from '@/lib/core/moduleHealthCheck';
checkModuleHealth().then(results => {
  console.log('[MAIN] Module health check completed:', results);
}).catch(error => {
  console.error('[MAIN] Module health check failed:', error);
});

// Sjekk API-status ved oppstart  
// validateEnvironment handles this now
try {
  // Log environment and startup details
  console.info('🚀 Homni Platform starting...');

  // Validate environment early - this will use the new logger system
  const envReport = validateEnvironment();
  console.info('Environment check:', envReport);
  console.log('[MAIN] Environment validation completed');
} catch (error) {
  console.error('[MAIN] Environment validation failed:', error);
}

// Force HashRouter for Lovable preview environments
const useHashRouter = import.meta.env.VITE_USE_HASHROUTER === 'true' || 
                      window.location.hostname.includes('lovable') || 
                      window.location.hostname.includes('sandbox');
const Router = useHashRouter ? HashRouter : BrowserRouter;

console.log('[MAIN] Using router:', useHashRouter ? 'HashRouter' : 'BrowserRouter');

console.log('[MAIN] Starting React render');

try {
  console.log('[MAIN] Attempting to render React app...');
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  console.log('[MAIN] Root element found, creating React root...');
  
  const root = createRoot(rootElement);
  console.log('[MAIN] React root created, rendering app...');
  
  root.render(
    <React.StrictMode>
      <AppProviders>
        <AuthProvider>
          <Router>
            <App />
          </Router>
        </AuthProvider>
      </AppProviders>
    </React.StrictMode>
  );
  console.log('[MAIN] React render completed successfully');
} catch (error) {
  console.error('[MAIN] React render failed:', error);
  console.error('[MAIN] Error stack:', error.stack);
  
  // Fallback simple render
  try {
    console.log('[MAIN] Attempting fallback render...');
    const rootElement = document.getElementById("root");
    if (rootElement) {
      const root = createRoot(rootElement);
      root.render(
        <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace' }}>
          <h1>Application Error</h1>
          <p><strong>Failed to load application:</strong> {error.message}</p>
          <p><strong>Error Type:</strong> {error.name}</p>
          <details>
            <summary>Error Details</summary>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {error.stack}
            </pre>
          </details>
          <p><em>Check browser console for more details</em></p>
        </div>
      );
      console.log('[MAIN] Fallback render completed');
    }
  } catch (fallbackError) {
    console.error('[MAIN] Even fallback render failed:', fallbackError);
    // Ultimate fallback
    if (document.getElementById("root")) {
      document.getElementById("root").innerHTML = `
        <div style="padding: 20px; color: red; font-family: monospace;">
          <h1>Critical Application Error</h1>
          <p>The application failed to start completely.</p>
          <p>Original error: ${error.message}</p>
          <p>Fallback error: ${fallbackError.message}</p>
        </div>
      `;
    }
  }
}
