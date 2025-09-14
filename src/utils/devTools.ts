/**
 * Development Tools and Debugging Utilities
 * Enhanced development experience with better debugging capabilities
 */

import { logger } from './logger';
import { validateEnvironment, logEnvironmentValidation } from '@/services/environmentValidator';

/**
 * Development tools interface for global access
 */
interface DevTools {
  logger: typeof logger;
  validateEnvironment: typeof validateEnvironment;
  logEnvironmentValidation: typeof logEnvironmentValidation;
  debugAuth: () => void;
  debugRouting: () => void;
  clearStorage: () => void;
  exportLogs: () => string;
}

/**
 * Debug authentication state
 */
const debugAuth = (): void => {
  if (import.meta.env.MODE !== 'development') return;
  
  console.group('🔐 Authentication Debug');
  
  // Check localStorage for auth tokens
  const authKeys = Object.keys(localStorage).filter(key => 
    key.includes('supabase') || key.includes('auth') || key.includes('session')
  );
  
  console.info('Auth-related localStorage keys:', authKeys);
  
  // Check sessionStorage
  const sessionKeys = Object.keys(sessionStorage).filter(key =>
    key.includes('supabase') || key.includes('auth') || key.includes('session')
  );
  
  console.info('Auth-related sessionStorage keys:', sessionKeys);
  
  // Log current URL for auth callbacks
  console.info('Current URL:', window.location.href);
  console.info('Hash:', window.location.hash);
  console.info('Search params:', window.location.search);
  
  console.groupEnd();
};

/**
 * Debug routing state
 */
const debugRouting = (): void => {
  if (import.meta.env.MODE !== 'development') return;
  
  console.group('🔄 Routing Debug');
  
  console.info('Current pathname:', window.location.pathname);
  console.info('Router mode:', import.meta.env.VITE_ROUTER_MODE || 'browser');
  console.info('Base URL:', window.location.origin);
  console.info('Hash routing active:', window.location.pathname.includes('#'));
  
  // Check for routing-related localStorage
  const routingKeys = Object.keys(localStorage).filter(key =>
    key.includes('route') || key.includes('navigation')
  );
  
  if (routingKeys.length > 0) {
    console.info('Routing-related storage:', routingKeys);
  }
  
  console.groupEnd();
};

/**
 * Clear all application storage
 */
const clearStorage = (): void => {
  if (import.meta.env.MODE !== 'development') return;
  
  console.group('🧹 Clearing Application Storage');
  
  const localStorageCount = localStorage.length;
  const sessionStorageCount = sessionStorage.length;
  
  localStorage.clear();
  sessionStorage.clear();
  
  console.info(`Cleared ${localStorageCount} localStorage items`);
  console.info(`Cleared ${sessionStorageCount} sessionStorage items`);
  
  // Clear cookies related to the app
  document.cookie.split(";").forEach((c) => {
    const eqPos = c.indexOf("=");
    const name = eqPos > -1 ? c.substr(0, eqPos) : c;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  });
  
  console.info('Application storage cleared');
  console.groupEnd();
  
  logger.info('Development storage cleared', {
    module: 'devTools',
    timestamp: new Date().toISOString()
  });
};

/**
 * Export application logs as JSON string
 */
const exportLogs = (): string => {
  const logs = {
    timestamp: new Date().toISOString(),
    environment: {
      mode: import.meta.env.MODE,
      validation: validateEnvironment(),
      userAgent: navigator.userAgent,
      url: window.location.href
    },
    storage: {
      localStorage: { ...localStorage },
      sessionStorage: { ...sessionStorage }
    },
    console: 'Check browser console for runtime logs'
  };
  
  const exportData = JSON.stringify(logs, null, 2);
  
  if (import.meta.env.MODE === 'development') {
    console.group('📤 Log Export');
    console.info('Export generated at:', logs.timestamp);
    console.info('Copy the following JSON:');
    console.log(exportData);
    console.groupEnd();
  }
  
  return exportData;
};

/**
 * Create development tools object
 */
const createDevTools = (): DevTools => ({
  logger,
  validateEnvironment,
  logEnvironmentValidation,
  debugAuth,
  debugRouting,
  clearStorage,
  exportLogs
});

/**
 * Initialize development tools in global scope
 */
export const initializeDevTools = (): void => {
  if (import.meta.env.MODE !== 'development') return;
  
  const devTools = createDevTools();
  
  // Attach to window for global access
  (window as any).__HOMNI_DEV__ = devTools;
  
  console.group('🛠️ Development Tools Initialized');
  console.info('Access via: window.__HOMNI_DEV__');
  console.info('Available methods:');
  console.info('  • logger - Enhanced logging utilities');
  console.info('  • validateEnvironment() - Check environment configuration');
  console.info('  • logEnvironmentValidation() - Log detailed environment status');
  console.info('  • debugAuth() - Debug authentication state');
  console.info('  • debugRouting() - Debug routing configuration');
  console.info('  • clearStorage() - Clear all application storage');
  console.info('  • exportLogs() - Export application logs');
  console.groupEnd();
  
  // Run initial environment validation
  logEnvironmentValidation();
};

/**
 * Performance monitoring helper
 */
export const monitorPerformance = (): void => {
  if (import.meta.env.MODE !== 'development') return;
  
  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((entries) => {
      entries.getEntries().forEach((entry) => {
        if (entry.duration > 50) { // Log tasks longer than 50ms
          logger.warn('Long task detected', {
            module: 'performance',
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['longtask'] });
  }
  
  // Monitor resource loading
  if ('PerformanceObserver' in window) {
    const resourceObserver = new PerformanceObserver((entries) => {
      entries.getEntries().forEach((entry) => {
        if (entry.duration > 1000) { // Log resources taking longer than 1s
          logger.warn('Slow resource loading', {
            module: 'performance',
            resource: entry.name,
            duration: entry.duration,
            type: (entry as any).initiatorType
          });
        }
      });
    });
    
    resourceObserver.observe({ entryTypes: ['resource'] });
  }
};

export { createDevTools };