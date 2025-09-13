#!/usr/bin/env node

/**
 * HOMNI Health Check Script
 * Comprehensive system validation for HOMNI platform
 * 
 * Usage: npm run health
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏥 HOMNI Health Check - Comprehensive System Validation\n');

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

function runCheck(name, command, description) {
  console.log(`🔍 ${description}...`);
  try {
    const output = execSync(command, { stdio: 'pipe' }).toString();
    console.log(`✅ ${name} - PASSED`);
    results.passed++;
    results.details.push({ name, status: 'PASSED', output: output.slice(0, 200) });
    return true;
  } catch (error) {
    console.error(`❌ ${name} - FAILED: ${error.message.slice(0, 100)}`);
    results.failed++;
    results.details.push({ name, status: 'FAILED', error: error.message.slice(0, 200) });
    return false;
  }
}

function checkFile(name, filePath, description) {
  console.log(`📁 ${description}...`);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${name} - EXISTS`);
    results.passed++;
    results.details.push({ name, status: 'EXISTS', path: filePath });
    return true;
  } else {
    console.error(`⚠️  ${name} - MISSING: ${filePath}`);
    results.warnings++;
    results.details.push({ name, status: 'MISSING', path: filePath });
    return false;
  }
}

console.log('📋 Phase 1: Build & Dependencies');
runCheck('TypeScript', 'npx tsc --noEmit', 'TypeScript compilation check');
runCheck('ESLint', 'npx eslint . --max-warnings 0', 'Code quality check');
runCheck('Build', 'npm run build', 'Production build verification');

console.log('\n📋 Phase 2: Project Structure');
checkFile('Main Config', 'vite.config.ts', 'Vite configuration');
checkFile('TypeScript Config', 'tsconfig.json', 'TypeScript configuration');
checkFile('Package Config', 'package.json', 'Package configuration');

console.log('\n📋 Phase 3: Authentication & Security');
checkFile('Auth Hook', 'src/modules/auth/hooks/useAuth.tsx', 'Authentication hook');
checkFile('Supabase Client', 'src/lib/supabaseClient.ts', 'Supabase client');
checkFile('Auth Status', 'src/components/auth/ImprovedAuthStatus.tsx', 'Auth status component');

console.log('\n📋 Phase 4: Seed Scripts & Test Data');
checkFile('Seed Script', 'scripts/seedTestUsers.ts', 'Test user seed script');
checkFile('Auth Seed', 'scripts/seedAuthUsers.ts', 'Auth user seed script');
checkFile('Shell Seed', 'scripts/seed-test-users.sh', 'Shell seed script');

console.log('\n📋 Phase 5: Documentation');
checkFile('Status', 'NOW.md', 'Current status documentation');
checkFile('Readme', 'README.md', 'Project readme');

// Performance & Bundle Size Check (if build exists)
if (fs.existsSync('dist')) {
  console.log('\n📋 Phase 6: Performance');
  try {
    const distSize = execSync('du -sh dist').toString().split('\t')[0];
    console.log(`📦 Bundle size: ${distSize}`);
    if (distSize.includes('M') && parseFloat(distSize) > 5) {
      console.warn(`⚠️  Large bundle detected: ${distSize}`);
      results.warnings++;
    } else {
      console.log('✅ Bundle size within acceptable limits');
      results.passed++;
    }
  } catch (e) {
    console.warn('⚠️  Could not check bundle size');
    results.warnings++;
  }
}

// Final Report
console.log('\n🏆 HOMNI Health Check Results');
console.log('==========================================');
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);
console.log(`📊 Success Rate: ${Math.round((results.passed / (results.passed + results.failed + results.warnings)) * 100)}%`);

if (results.failed > 0) {
  console.log('\n🚨 Critical Issues Detected:');
  results.details
    .filter(d => d.status === 'FAILED')
    .forEach(d => console.log(`   • ${d.name}: ${d.error || 'Build failed'}`));
}

if (results.warnings > 0) {
  console.log('\n⚠️  Warnings:');
  results.details
    .filter(d => d.status === 'MISSING')
    .forEach(d => console.log(`   • ${d.name}: ${d.path} not found`));
}

// Exit with proper code
const exitCode = results.failed > 0 ? 1 : 0;
console.log(`\n${exitCode === 0 ? '🎉' : '💥'} Health check ${exitCode === 0 ? 'completed successfully' : 'failed'}`);
process.exit(exitCode);