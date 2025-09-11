import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { identify as coreIdentify, page as corePage, track as coreTrack } from './index';
import { useLocation } from 'react-router-dom';

type AnalyticsAPI = {
  track: typeof coreTrack;
  page: typeof corePage;
  identify: typeof coreIdentify;
};

const AnalyticsCtx = createContext<AnalyticsAPI | null>(null);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // Beskytt mot dobbel-registrering i StrictMode:
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    if (typeof window !== 'undefined') {
      const onErr = (event: ErrorEvent) => {
        coreTrack('js_error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      };
      const onRej = (event: PromiseRejectionEvent) => {
        coreTrack('unhandled_promise_rejection', { reason: String(event.reason) });
      };
      window.addEventListener('error', onErr);
      window.addEventListener('unhandledrejection', onRej);

      return () => {
        window.removeEventListener('error', onErr);
        window.removeEventListener('unhandledrejection', onRej);
      };
    }
  }, []);

  const api = useMemo<AnalyticsAPI>(() => ({
    track: coreTrack,
    page: corePage,
    identify: coreIdentify,
  }), []);

  return <AnalyticsCtx.Provider value={api}>{children}</AnalyticsCtx.Provider>;
}

export function useAnalytics() {
  const ctx = useContext(AnalyticsCtx);
  if (!ctx) throw new Error('useAnalytics must be used within <AnalyticsProvider>');
  return ctx;
}

// Automatisk sidevisning via React Router v6
export function usePageViews() {
  const { pathname } = useLocation();
  const { page } = useAnalytics();

  useEffect(() => {
    // initial + hver path-endring
    page(pathname, document?.title);
  }, [pathname, page]);
}