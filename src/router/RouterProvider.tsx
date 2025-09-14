import React from 'react';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { getEnv } from '@/utils/env';
import { log } from '@/utils/logger';

type Props = { children: React.ReactNode };

/**
 * Strategy:
 * - Respect VITE_ROUTER_STRATEGY=hash|browser if provided
 * - Otherwise: use HashRouter in Lovable/sandbox hosts, BrowserRouter elsewhere
 * - SSR-safe (guards access to window)
 */
export function RouterProvider({ children }: Props) {
  const env = getEnv();
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const inLovable = /lovable|sandbox|vercel/.test(host);
  const strategy =
    (typeof import.meta !== 'undefined' &&
      (import.meta as any).env?.VITE_ROUTER_STRATEGY) ||
    (inLovable ? 'hash' : 'browser');

  const R = strategy === 'hash' ? HashRouter : BrowserRouter;
  
  if (env.DEV) {
    log.info('[RouterProvider] strategy =', strategy, 'host =', host);
  }
  
  return <R>{children}</R>;
}