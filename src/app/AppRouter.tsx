import React from 'react';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { isLovablePreviewHost } from '@/lib/env/hosts';

interface AppRouterProps {
  children: React.ReactNode;
}

// EMERGENCY: Force HashRouter for all preview environments
export function AppRouter({ children }: AppRouterProps) {
  // Emergency detection
  const isLovableHost = isLovablePreviewHost();
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isPreview = hostname.includes('lovable') || hostname.includes('sandbox');
  
  // Force hash router in any preview-like environment
  const forceHash = isLovableHost || isPreview || import.meta.env.VITE_ROUTER_MODE === 'hash';
  const R: any = forceHash ? HashRouter : BrowserRouter;

  // EMERGENCY: Enhanced diagnostics 
  console.error('[EMERGENCY ROUTER] Configuration:', {
    hostname,
    isLovableHost,
    isPreview,
    forceHash,
    mode: forceHash ? 'HASH_FORCED' : 'browser',
    routerType: R === HashRouter ? 'HashRouter' : 'BrowserRouter',
    location: typeof window !== 'undefined' ? window.location.href : '(ssr)'
  });

  return <R basename={import.meta.env.BASE_URL || '/'}>{children}</R>;
}
