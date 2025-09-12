/**
 * Host detection utilities for environment-specific behavior
 * Provides reliable detection of Lovable preview environments
 */

import { logger } from '@/utils/logger';

export function isLovablePreviewHost(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  const isLovable = hostname.includes('lovableproject.com') || 
         hostname.includes('lovable.app') || 
         hostname.includes('lovable.dev') ||
         hostname.includes('.sandbox.lovable.dev');
  
  // Debug logging for preview detection
  logger.info('[Host Detection]', {
    module: 'hostDetection',
    hostname,
    isLovable,
    contains: {
      lovableproject: hostname.includes('lovableproject.com'),
      lovableApp: hostname.includes('lovable.app'), 
      lovableDev: hostname.includes('lovable.dev'),
      sandboxLovableDev: hostname.includes('.sandbox.lovable.dev')
    }
  });
  
  return isLovable;
}

export function getHostEnvironment(): 'preview' | 'development' | 'production' {
  if (isLovablePreviewHost()) return 'preview';
  if (import.meta.env.DEV) return 'development';
  return 'production';
}