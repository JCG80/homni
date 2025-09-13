#!/usr/bin/env node

/**
 * CI Health Check - Optimized for CI/CD Pipeline
 * Fast health validation suitable for GitHub Actions or deployment pipelines
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 CI Health Check - HOMNI Platform\n');

const checks = [
  {
    name: 'Dependencies',
    cmd: 'npm list --depth=0',
    timeout: 10000,
    critical: true
  },
  {
    name: 'TypeScript',
    cmd: 'npx tsc --noEmit',
    timeout: 30000,
    critical: true
  },
  {
    name: 'Build',
    cmd: 'npm run build',
    timeout: 60000,
    critical: true
  },
  {
    name: 'Seed Scripts',
    cmd: 'node -c scripts/seedTestUsers.ts',
    timeout: 5000,
    critical: false
  }
];

let passed = 0;
let failed = 0;

for (const check of checks) {
  process.stdout.write(`${check.name}...`);
  
  try {
    execSync(check.cmd, { 
      stdio: 'pipe', 
      timeout: check.timeout 
    });
    console.log(' ✅');
    passed++;
  } catch (error) {
    console.log(' ❌');
    if (check.critical) {
      console.error(`CRITICAL FAILURE: ${check.name}`);
      console.error(error.message.slice(0, 200));
      failed++;
    } else {
      console.warn(`Warning: ${check.name} failed (non-critical)`);
    }
  }
}

// Summary
console.log(`\n📊 Results: ${passed}/${checks.length} passed`);

if (failed > 0) {
  console.error('❌ Critical failures detected');
  process.exit(1);
} else {
  console.log('✅ All critical checks passed');
  process.exit(0);
}