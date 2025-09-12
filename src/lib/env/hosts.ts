/**
 * Host detection utilities for environment-specific behavior
 * Provides reliable detection of Lovable preview environments
 */

export function isLovablePreviewHost(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname.includes('lovableproject.com') || 
         hostname.includes('lovable.app') || 
         hostname.includes('lovable.dev');
}

export function getHostEnvironment(): 'preview' | 'development' | 'production' {
  if (isLovablePreviewHost()) return 'preview';
  if (import.meta.env.DEV) return 'development';
  return 'production';
}