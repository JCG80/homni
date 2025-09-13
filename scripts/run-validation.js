#!/usr/bin/env node

/**
 * HOMNI Platform - Complete Validation Script
 * Runs comprehensive E2E tests and validation checks
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 HOMNI Platform - Complete Validation Suite\n');

const results = {
  passed: 0,
  failed: 0,
  total: 0
};

function runTest(name, command, description) {
  console.log(`🧪 ${description}...`);
  try {
    const output = execSync(command, { stdio: 'pipe' }).toString();
    console.log(`✅ ${name} - PASSED`);
    results.passed++;
    results.total++;
    return true;
  } catch (error) {
    console.error(`❌ ${name} - FAILED: ${error.message.slice(0, 100)}`);
    results.failed++;
    results.total++;
    return false;
  }
}

console.log('📋 Phase 1: System Health Check');
runTest('Health Check', 'node scripts/health-check.js', 'Running comprehensive health check');

console.log('\n📋 Phase 2: Authentication & Security Tests');
runTest('Auth Integration', 'npx playwright test e2e-tests/auth-integration.spec.ts --headed=false', 'Testing authentication flows');
runTest('Auth Basics', 'npx playwright test e2e-tests/auth.spec.ts --headed=false', 'Testing basic auth redirects');

console.log('\n📋 Phase 3: API & Database Tests');
runTest('API Smoke Tests', 'npx vitest run e2e-tests/api-smoke.spec.ts', 'Testing API endpoints');
runTest('RLS Security', 'npx vitest run e2e-tests/rls.spec.ts', 'Testing database security');

console.log('\n📋 Phase 4: User Journey Tests');
runTest('Comprehensive Parity', 'npx playwright test e2e-tests/comprehensive-parity.spec.ts --headed=false', 'Testing mobile/desktop parity');

// Final Report
console.log('\n🏆 HOMNI Validation Results');
console.log('==========================================');
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`📊 Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);

const status = results.failed === 0 ? 'READY FOR PRODUCTION' : 'NEEDS ATTENTION';
console.log(`\n🎯 Platform Status: ${status}`);

if (results.failed > 0) {
  console.log('\n🚨 Some tests failed. Please review the output above.');
  process.exit(1);
} else {
  console.log('\n🎉 All validation tests passed! Platform is ready for production.');
  process.exit(0);
}