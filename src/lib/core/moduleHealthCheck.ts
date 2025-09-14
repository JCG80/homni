/**
 * Module Health Check - Debug module loading issues
 */

import { logger } from '@/utils/logger';

export async function checkModuleHealth() {
  const results = {
    auth: false,
    leads: false,
    properties: false,
    dashboard: false,
    notifications: false
  };

  console.log('[MODULE_HEALTH] Starting module health check...');

  // Test each core module
  const modules = ['auth', 'leads', 'properties', 'dashboard', 'notifications'];
  
  for (const moduleName of modules) {
    try {
      console.log(`[MODULE_HEALTH] Testing module: ${moduleName}`);
      const module = await import(`@/modules/${moduleName}/index`);
      
      if (module.manifest && module.default) {
        console.log(`[MODULE_HEALTH] ✅ Module ${moduleName} loaded successfully`);
        console.log(`[MODULE_HEALTH] - Manifest ID: ${module.manifest.id}`);
        console.log(`[MODULE_HEALTH] - Version: ${module.manifest.version}`);
        results[moduleName] = true;
      } else {
        console.error(`[MODULE_HEALTH] ❌ Module ${moduleName} missing manifest or default export`);
        console.log(`[MODULE_HEALTH] - Has manifest: ${!!module.manifest}`);
        console.log(`[MODULE_HEALTH] - Has default: ${!!module.default}`);
      }
    } catch (error) {
      console.error(`[MODULE_HEALTH] ❌ Module ${moduleName} failed to load:`, error);
      logger.error(`Module health check failed for ${moduleName}`, { error });
    }
  }

  console.log('[MODULE_HEALTH] Health check results:', results);
  return results;
}

export function createModuleHealthReport() {
  return {
    timestamp: new Date().toISOString(),
    environment: import.meta.env.MODE,
    hostname: window.location.hostname,
    userAgent: navigator.userAgent
  };
}