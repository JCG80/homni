#!/usr/bin/env node

/**
 * Update package.json with Mobile/PC Parity scripts
 * Adds validation and health check commands
 */

import { readFileSync, writeFileSync } from 'fs';

function updatePackageScripts() {
  console.log('📦 Updating package.json scripts for Mobile/PC Parity...');
  
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    
    // Add new scripts while preserving existing ones
    const newScripts = {
      ...packageJson.scripts,
      
      // Environment and CORS validation
      'check:env': 'node scripts/checkEnvAndCors.mjs',
      
      // Repository health checks
      'check:health': 'node scripts/repo-health.mjs',
      
      // Combined pre-deployment check
      'check:deploy': 'node scripts/pre-deployment-check.mjs',
      
      // Testing
      'test:e2e:parity': 'playwright test e2e-tests/mobile-pc-parity.spec.ts',
      'test:e2e:full': 'playwright test',
      
      // Development utilities
      'clean:cache': 'node -e "import(\\"./src/pwa/cleanup.ts\\").then(m => m.performDevCleanup())"',
      'analyze:routes': 'node scripts/repo-health.mjs',
      
      // CI/CD helpers
      'ci:validate': 'npm run check:env && npm run check:health && npm run build',
      'ci:test': 'npm run test && npm run test:e2e:parity'
    };
    
    // Update the package.json
    const updatedPackageJson = {
      ...packageJson,
      scripts: newScripts
    };
    
    writeFileSync('package.json', JSON.stringify(updatedPackageJson, null, 2) + '\n');
    
    console.log('✅ Package.json scripts updated successfully');
    console.log('\nNew scripts added:');
    Object.keys(newScripts).forEach(script => {
      if (!packageJson.scripts[script]) {
        console.log(`  - ${script}: ${newScripts[script]}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to update package.json:', error.message);
    process.exit(1);
  }
}

updatePackageScripts();