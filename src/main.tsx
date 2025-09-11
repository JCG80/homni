
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AppProviders } from './app/AppProviders';
import { BrowserRouter, HashRouter } from 'react-router-dom';

// Router mode configuration for Lovable deployment compatibility
const useHashRouter = import.meta.env.VITE_ROUTER_MODE === 'hash' || 
                      (typeof window !== 'undefined' && window.location.hostname.includes('lovableproject.com'));
const Router = useHashRouter ? HashRouter : BrowserRouter;

// Ensure non-hash paths redirect to hash-based routing on Lovable domains
if (useHashRouter && typeof window !== 'undefined') {
  const { hash, pathname, search } = window.location;
  if (!hash && pathname && pathname !== '/') {
    const newUrl = `/#${pathname}${search}`;
    window.history.replaceState(null, '', newUrl);
  }
}

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <Router>
      <App />
    </Router>
  </AppProviders>
);
