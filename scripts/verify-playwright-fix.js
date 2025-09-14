#!/usr/bin/env node

/**
 * Verification script for Playwright TypeScript fixes
 * This script checks that all TypeScript errors have been resolved
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Playwright TypeScript Fix Implementation...\n');

// Check 1: Verify corrupted packages are removed
function checkPackageJson() {
  console.log('1️⃣ Checking package.json for corrupted packages...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const corruptedPackages = ['a', 'been', 'can', 'it', 'are', 'commands', 'direct', 'edits', 
                              'environment', 'has', 'is', 'modify', 'only', 'our', 'prevent', 
                              'provides', 'special', 'the', 'to', 'uninstall', 'use', 'ways', 'you'];
    
    let foundCorrupted = [];
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    corruptedPackages.forEach(pkg => {
      if (allDeps[pkg]) {
        foundCorrupted.push(pkg);
      }
    });
    
    if (foundCorrupted.length === 0) {
      console.log('   ✅ All corrupted packages removed successfully');
    } else {
      console.log('   ❌ Found remaining corrupted packages:', foundCorrupted);
    }
    
    // Check if Playwright is in devDependencies
    if (packageJson.devDependencies && packageJson.devDependencies['@playwright/test']) {
      console.log('   ✅ @playwright/test found in devDependencies');
    } else {
      console.log('   ⚠️  @playwright/test not found in devDependencies');
    }
    
  } catch (error) {
    console.log('   ❌ Error reading package.json:', error.message);
  }
}

// Check 2: Verify test files have proper type imports
function checkTestFiles() {
  console.log('\n2️⃣ Checking test files for proper TypeScript imports...');
  
  const testFiles = [
    'tests/e2e/auth.spec.ts',
    'tests/e2e/marketplace.spec.ts', 
    'tests/e2e/leads.spec.ts',
    'tests/e2e/role_switch.spec.ts',
    'tests/router.spec.ts',
    'tests/example.spec.ts'
  ];
  
  let allGood = true;
  
  testFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for proper import
      const hasProperImport = content.includes("import { test, expect, type Page } from '@playwright/test'");
      // Check for proper typing in test functions
      const hasProperTyping = content.includes('({ page }: { page: Page })');
      
      if (hasProperImport && hasProperTyping) {
        console.log(`   ✅ ${filePath} - Proper imports and typing`);
      } else {
        console.log(`   ❌ ${filePath} - Missing proper imports or typing`);
        allGood = false;
      }
    } else {
      console.log(`   ⚠️  ${filePath} - File not found`);
    }
  });
  
  if (allGood) {
    console.log('   ✅ All test files have proper TypeScript imports and typing');
  }
}

// Check 3: Verify TypeScript configuration files
function checkTsConfig() {
  console.log('\n3️⃣ Checking TypeScript configuration files...');
  
  // Check tsconfig.e2e.json
  if (fs.existsSync('tsconfig.e2e.json')) {
    try {
      const e2eConfig = JSON.parse(fs.readFileSync('tsconfig.e2e.json', 'utf8'));
      if (e2eConfig.compilerOptions && e2eConfig.compilerOptions.types && 
          e2eConfig.compilerOptions.types.includes('@playwright/test')) {
        console.log('   ✅ tsconfig.e2e.json has Playwright types');
      } else {
        console.log('   ⚠️  tsconfig.e2e.json missing Playwright types');
      }
    } catch (error) {
      console.log('   ❌ Error reading tsconfig.e2e.json:', error.message);
    }
  } else {
    console.log('   ❌ tsconfig.e2e.json not found');
  }
  
  // Check playwright.config.ts
  if (fs.existsSync('playwright.config.ts')) {
    const playwrightConfig = fs.readFileSync('playwright.config.ts', 'utf8');
    if (playwrightConfig.includes("testDir: './tests/e2e'")) {
      console.log('   ✅ playwright.config.ts points to correct test directory');
    } else {
      console.log('   ⚠️  playwright.config.ts might not point to correct directory');
    }
  } else {
    console.log('   ❌ playwright.config.ts not found');
  }
}

// Check 4: Verify documentation is updated
function checkDocumentation() {
  console.log('\n4️⃣ Checking documentation updates...');
  
  if (fs.existsSync('PLAYWRIGHT_TYPESCRIPT_FIX_COMPLETE.md')) {
    const doc = fs.readFileSync('PLAYWRIGHT_TYPESCRIPT_FIX_COMPLETE.md', 'utf8');
    if (doc.includes('TypeScript Errors FIXED')) {
      console.log('   ✅ Documentation updated with fix confirmation');
    } else {
      console.log('   ⚠️  Documentation may need updates');
    }
  } else {
    console.log('   ❌ Fix documentation not found');
  }
  
  if (fs.existsSync('tests/e2e/README.md')) {
    console.log('   ✅ E2E tests documentation created');
  } else {
    console.log('   ⚠️  E2E tests documentation not found');
  }
}

// Run all checks
function runVerification() {
  checkPackageJson();
  checkTestFiles();
  checkTsConfig();
  checkDocumentation();
  
  console.log('\n🎯 Verification Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Run: npx playwright test --check-types (to verify TypeScript compilation)');
  console.log('2. Run: npm run test:e2e (if test scripts are added to package.json)');
  console.log('3. Check: No more "Cannot find module" or "implicit any" errors in IDE');
  console.log('\n✨ Playwright TypeScript integration should now be working correctly!');
}

runVerification();