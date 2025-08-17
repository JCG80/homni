#!/usr/bin/env ts-node

/**
 * Repository health check script
 */

import { execSync } from 'child_process';

console.log('🏥 Repository Health Check');
console.log('═'.repeat(40));

let allPassed = true;

// Core checks
const checks = [
  { name: 'TypeScript', cmd: 'npx tsc --noEmit' },
  { name: 'ESLint', cmd: 'npm run lint' },
  { name: 'Build', cmd: 'npm run build' }
];

checks.forEach(({ name, cmd }) => {
  try {
    console.log(`🔍 ${name}...`);
    execSync(cmd, { stdio: 'pipe' });
    console.log(`✅ ${name} passed`);
  } catch (error) {
    console.log(`❌ ${name} failed`);
    allPassed = false;
  }
});

console.log('\n🎯 SUMMARY');
if (allPassed) {
  console.log('✅ All checks passed!');
  process.exit(0);
} else {
  console.log('❌ Some checks failed');
  process.exit(1);
}