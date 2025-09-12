import React from 'react';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { isLovablePreviewHost } from '@/lib/env/hosts';

interface AppRouterProps {
  children: React.ReactNode;
}

// Centralized router wrapper with preview-safe defaults
export function AppRouter({ children }: AppRouterProps) {
  const isLovableHost = isLovablePreviewHost();
  const envMode = import.meta.env.VITE_ROUTER_MODE as string | undefined;
  // Force hash mode for Lovable preview or when explicitly set
  const useHash = envMode === 'hash' || isLovableHost;
  const R: any = useHash ? HashRouter : BrowserRouter;

  if (import.meta.env.DEV) {
    // Deterministic router diagnostics
    console.info('[Router] mode:', useHash ? 'hash' : 'browser', {
      VITE_ROUTER_MODE: envMode || '(unset)',
      hostname: typeof window !== 'undefined' ? window.location.hostname : '(ssr)'
    });
  }

  return <R basename={import.meta.env.BASE_URL || '/'}>{children}</R>;
}
