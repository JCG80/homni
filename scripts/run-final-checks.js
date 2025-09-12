#!/usr/bin/env node

/**
 * Run final HOMNI implementation checks
 * Execute this script to verify complete implementation
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Running HOMNI Final Implementation Checks...\n');

// Function to run command safely
function runCommand(command, description) {
  console.log(`🔍 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} passed\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed\n`);
    return false;
  }
}

let passed = 0;
let total = 0;

// Check if health scripts exist and run them
total++;
if (fs.existsSync('scripts/health/check-duplicate-checklists.js')) {
  if (runCommand('node scripts/health/check-duplicate-checklists.js', 'Duplicate checklist check')) {
    passed++;
  }
} else {
  console.log('⚠️  Duplicate checklist check script not found - skipping\n');
}

total++;
if (fs.existsSync('scripts/health/check-routes-and-imports.js')) {
  if (runCommand('node scripts/health/check-routes-and-imports.js', 'Routes and imports check')) {
    passed++;
  }
} else {
  console.log('⚠️  Routes check script not found - skipping\n');
}

total++;
if (fs.existsSync('scripts/health/check-docs-updated.js')) {
  if (runCommand('node scripts/health/check-docs-updated.js', 'Documentation sync check')) {
    passed++;
  }
} else {
  console.log('⚠️  Documentation check script not found - skipping\n');
}

// Check TypeScript compilation
total++;
if (runCommand('npx tsc --noEmit', 'TypeScript compilation check')) {
  passed++;
}

// Check if build works
total++;
if (runCommand('npm run build', 'Build verification')) {
  passed++;
}

console.log('📊 Final Results:');
console.log('==================');
console.log(`Passed: ${passed}/${total} checks`);

if (passed === total) {
  console.log('\n🎉 All checks passed! HOMNI implementation is ready.');
  console.log('\nNext steps:');
  console.log('1. Test the maintenance module at /maintenance');
  console.log('2. Verify admin debug tools are available');  
  console.log('3. Check desktop routing works properly');
  console.log('4. Review ROADMAP.md for next phase planning');
} else {
  console.log('\n⚠️  Some checks failed. Please review and fix issues.');
  process.exit(1);
}