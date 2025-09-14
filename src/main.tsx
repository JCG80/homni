
import React from 'react';
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App.tsx'
import './index.css'
import { AuthProvider } from '@/modules/auth/context/AuthProvider';
import { AppProviders } from './app/AppProviders';
import { logApiStatusWarnings } from '@/services/apiStatus';

// Sjekk API-status ved oppstart
logApiStatusWarnings();

// Force HashRouter for Lovable preview environments
const useHashRouter = import.meta.env.VITE_USE_HASHROUTER === 'true' || 
                      window.location.hostname.includes('lovable') || 
                      window.location.hostname.includes('sandbox');
const Router = useHashRouter ? HashRouter : BrowserRouter;

createRoot(document.getElementById("root")!).render(
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
