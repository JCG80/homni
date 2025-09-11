// Minimal, adapter-based analytics – SSR/Edge-safe

export type AnalyticsProps = Record<string, unknown>;

export interface AnalyticsDestination {
  name: string;
  init?: () => void;
  track?: (event: string, props?: AnalyticsProps) => void;
  page?: (path: string, title?: string) => void;
  identify?: (userId: string, traits?: AnalyticsProps) => void;
  flush?: () => Promise<void> | void;
}

const destinations: AnalyticsDestination[] = [];

// Dev-konsoll som default i DEV
if (import.meta.env.DEV && import.meta.env.VITE_ANALYTICS_CONSOLE !== 'false') {
  destinations.push({
    name: 'console',
    track: (e, p) => console.log('[analytics:track]', e, p ?? {}),
    page: (path, title) => console.log('[analytics:page]', path, title ?? ''),
    identify: (id, traits) => console.log('[analytics:identify]', id, traits ?? {}),
  });
}

export function registerDestination(dest: AnalyticsDestination) {
  destinations.push(dest);
  dest.init?.();
}

export function track(event: string, props?: AnalyticsProps) {
  for (const d of destinations) d.track?.(event, props);
}

export function page(path: string, title?: string) {
  for (const d of destinations) d.page?.(path, title);
}

export function identify(userId: string, traits?: AnalyticsProps) {
  for (const d of destinations) d.identify?.(userId, traits);
}

export async function flush() {
  await Promise.allSettled(destinations.map(d => Promise.resolve(d.flush?.())));
}

// Performance helpers (try/catch)
export const Perf = {
  mark(name: string) {
    try {
      if (typeof performance !== 'undefined' && performance.mark) performance.mark(name);
    } catch {}
  },
  measure(name: string, start: string, end: string) {
    try {
      if (typeof performance !== 'undefined' && performance.measure) performance.measure(name, start, end);
    } catch {}
  },
  getEntries(): PerformanceEntry[] {
    try {
      if (typeof performance !== 'undefined' && performance.getEntriesByType) {
        return performance.getEntriesByType('measure');
      }
    } catch {}
    return [];
  },
};