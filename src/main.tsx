
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter, HashRouter } from 'react-router-dom'

// Environment-driven router selection
const Router = import.meta.env.VITE_ROUTER_MODE === 'hash' ? HashRouter : BrowserRouter;

// Initialize analytics system if available
const initializeApp = async () => {
  try {
    const { initializeAnalytics, setupPageViewTracking } = await import('@/lib/analytics');
    initializeAnalytics();
    setupPageViewTracking();
  } catch (error) {
    console.warn('Analytics system not available:', error);
  }

  // Import flow validators for development testing  
  if (import.meta.env.DEV) {
    try {
      await import('./utils/testAuthFlow');
      await import('./utils/e2eFlowValidator');
    } catch (error) {
      console.warn('Dev utilities not available:', error);
    }
  }
};

// Initialize app
initializeApp();

createRoot(document.getElementById("root")!).render(
  <Router>
    <App />
  </Router>
);
