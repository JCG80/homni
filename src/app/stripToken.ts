/**
 * Token cleanup utility - removes __lovable_token from URL after app initialization
 * Prevents authentication token from persisting in browser address bar
 */

export function stripLovableToken() {
  if (typeof window === 'undefined') return;
  
  const url = new URL(window.location.href);
  if (url.searchParams.has('__lovable_token')) {
    console.info('Removing __lovable_token from URL');
    url.searchParams.delete('__lovable_token');
    window.history.replaceState({}, '', url.pathname + url.search + url.hash);
  }
}

export function hasLovableToken(): boolean {
  if (typeof window === 'undefined') return false;
  return new URL(window.location.href).searchParams.has('__lovable_token');
}