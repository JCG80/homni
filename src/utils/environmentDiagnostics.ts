/**
 * Environment diagnostics and auto-configuration utilities
 * Helps detect and resolve common environment-related issues
 */

import { isLovablePreviewHost } from '@/lib/env/hosts';

export interface EnvironmentDiagnostics {
  routerMode: string;
  isLovableHost: boolean;
  shouldUseHashRouter: boolean;
  hasRequiredEnvVars: boolean;
  missingEnvVars: string[];
  currentUrl: string;
  hasToken: boolean;
}

export function getEnvironmentDiagnostics(): EnvironmentDiagnostics {
  const isLovableHost = isLovablePreviewHost();
  const routerMode = process.env.VITE_ROUTER_MODE || 'browser';
  const shouldUseHashRouter = routerMode === 'hash' || isLovableHost;
  
  // Check for required environment variables
  const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  return {
    routerMode,
    isLovableHost,
    shouldUseHashRouter,
    hasRequiredEnvVars: missingEnvVars.length === 0,
    missingEnvVars,
    currentUrl: typeof window !== 'undefined' ? window.location.href : '',
    hasToken: typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('__lovable_token'),
  };
}

export function logEnvironmentDiagnostics(): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  const diagnostics = getEnvironmentDiagnostics();
  
  console.group('🔧 Environment Diagnostics');
  console.info('Router configuration:', {
    mode: diagnostics.routerMode,
    shouldUseHash: diagnostics.shouldUseHashRouter,
    isLovableHost: diagnostics.isLovableHost,
  });
  
  if (!diagnostics.hasRequiredEnvVars) {
    console.warn('Missing environment variables:', diagnostics.missingEnvVars);
  }
  
  if (diagnostics.hasToken) {
    console.info('Lovable token detected - will be cleaned up');
  }
  
  console.groupEnd();
}

export function autoConfigureEnvironment(): void {
  // Log diagnostics in development
  logEnvironmentDiagnostics();
  
  // Auto-set router mode for Lovable hosts if not explicitly set
  const diagnostics = getEnvironmentDiagnostics();
  
  if (diagnostics.isLovableHost && !process.env.VITE_ROUTER_MODE) {
    console.info('🔧 Auto-configuring hash router for Lovable preview');
  }
  
  // Aggressive cleanup in preview to prevent stale state
  if (diagnostics.isLovableHost) {
    // Clear potential stale service worker state
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      });
    }
  }
}