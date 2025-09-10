
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { initializeAnalytics, setupPageViewTracking } from '@/lib/analytics'

// Import flow validators for development testing
if (import.meta.env.DEV) {
  import('./utils/testAuthFlow');
  import('./utils/e2eFlowValidator');
}

// Initialize analytics system
initializeAnalytics();

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Setup automatic page view tracking
setupPageViewTracking();

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
