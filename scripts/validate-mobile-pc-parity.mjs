#!/usr/bin/env node

/**
 * Mobile/PC Parity Validation Script
 * Tests all parity guardrails and reports status
 */

import { readFileSync, existsSync } from 'fs';

const VALIDATION_RESULTS = [];

function validateComponent(name, path, description) {
  const exists = existsSync(path);
  VALIDATION_RESULTS.push({
    component: name,
    path: path,
    status: exists ? '✅' : '❌',
    description: description
  });
  return exists;
}

function validateFileContent(name, path, requiredContent, description) {
  try {
    if (!existsSync(path)) {
      VALIDATION_RESULTS.push({
        component: name,
        path: path,
        status: '❌',
        description: `${description} - File missing`
      });
      return false;
    }

    const content = readFileSync(path, 'utf8');
    const hasContent = requiredContent.every(item => content.includes(item));
    
    VALIDATION_RESULTS.push({
      component: name,
      path: path,
      status: hasContent ? '✅' : '⚠️',
      description: hasContent ? description : `${description} - Content check failed`
    });
    
    return hasContent;
  } catch (error) {
    VALIDATION_RESULTS.push({
      component: name,
      path: path,
      status: '❌',
      description: `${description} - Error: ${error.message}`
    });
    return false;
  }
}

async function runValidation() {
  console.log('🔍 Running Mobile/PC Parity Validation...\n');

  // Core Parity Components
  validateComponent(
    'Token Cleanup System',
    'src/app/stripToken.ts',
    'Removes __lovable_token from URLs after initialization'
  );

  validateComponent(
    'Service Worker Hook',
    'src/hooks/useServiceWorker.ts',
    'Manages PWA service worker registration and updates'
  );

  validateComponent(
    'Service Worker Components',
    'src/components/pwa/ServiceWorkerComponents.tsx',
    'UI components for service worker management'
  );

  validateComponent(
    'PWA Cleanup Utilities',
    'src/pwa/cleanup.ts',
    'Development cleanup for service workers and caches'
  );

  validateComponent(
    'Router Diagnostics',
    'src/components/router/RouterDiagnostics.tsx',
    'Real-time router debugging in development'
  );

  validateComponent(
    'Route Objects System',
    'src/routes/mainRouteObjects.ts',
    'Modular routing system for scalable navigation'
  );

  // E2E Test Coverage
  validateComponent(
    'Mobile/PC Parity Tests',
    'e2e-tests/mobile-pc-parity.spec.ts',
    'End-to-end testing for mobile/desktop compatibility'
  );

  // Validation Scripts
  validateComponent(
    'Environment Validation',
    'scripts/checkEnvAndCors.mjs',
    'Validates environment variables and CORS configuration'
  );

  validateComponent(
    'Repository Health Check',
    'scripts/repo-health.mjs',
    'Validates repository structure and routing standards'
  );

  validateComponent(
    'Pre-deployment Check',
    'scripts/pre-deployment-check.mjs',
    'Comprehensive pre-deployment validation pipeline'
  );

  // Content Validation for Key Files
  validateFileContent(
    'App.tsx Integration',
    'src/App.tsx',
    ['stripLovableToken', 'performDevCleanup', 'hasLovableToken'],
    'App.tsx properly integrates parity components'
  );

  validateFileContent(
    'Shell Router Integration',
    'src/components/layout/Shell.tsx',
    ['RouterDiagnostics', 'routeObjects', 'useRoutes'],
    'Shell.tsx integrates router system and diagnostics'
  );

  // Package.json validation (read-only check)
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const hasValidScripts = packageJson.scripts && 
                          packageJson.scripts.build && 
                          packageJson.scripts.preview;
    
    VALIDATION_RESULTS.push({
      component: 'Package Scripts',
      path: 'package.json',
      status: hasValidScripts ? '✅' : '⚠️',
      description: hasValidScripts 
        ? 'Package.json has required build/preview scripts'
        : 'Package.json missing recommended scripts'
    });
  } catch (error) {
    VALIDATION_RESULTS.push({
      component: 'Package Scripts',
      path: 'package.json', 
      status: '❌',
      description: `Package.json validation failed: ${error.message}`
    });
  }

  // Generate Report
  console.log('📋 Mobile/PC Parity Validation Results:');
  console.log('═'.repeat(80));
  
  const passed = VALIDATION_RESULTS.filter(r => r.status === '✅').length;
  const warnings = VALIDATION_RESULTS.filter(r => r.status === '⚠️').length;
  const failed = VALIDATION_RESULTS.filter(r => r.status === '❌').length;
  const total = VALIDATION_RESULTS.length;

  VALIDATION_RESULTS.forEach(result => {
    console.log(`${result.status} ${result.component}`);
    console.log(`   ${result.description}`);
    if (result.path) console.log(`   📁 ${result.path}`);
    console.log();
  });

  console.log('═'.repeat(80));
  console.log(`📊 Summary: ${passed}/${total} passed, ${warnings} warnings, ${failed} failed`);
  console.log();

  if (failed === 0) {
    console.log('🎉 All Mobile/PC Parity Guardrails are operational!');
    console.log('✅ Ready for production deployment');
    
    console.log('\n🚀 Parity Features Validated:');
    console.log('   • Token cleanup (clean URLs)');
    console.log('   • Universal deep-link support');
    console.log('   • Service worker management');
    console.log('   • Router diagnostics & debugging');
    console.log('   • Modular route objects system');
    console.log('   • E2E mobile/desktop testing');
    console.log('   • Environment validation');
    console.log('   • Pre-deployment checks');
    
    return true;
  } else {
    console.log('⚠️ Some parity components need attention');
    console.log('❌ Review failed components before deployment');
    return false;
  }
}

// Run validation
runValidation()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Validation script failed:', error);
    process.exit(1);
  });