#!/usr/bin/env tsx

/**
 * Cypress Setup Verification Script
 * Verifies TypeScript configuration and Cypress installation
 */

import { existsSync, readFileSync } from 'fs';
import { execSync } from 'child_process';

interface VerificationResult {
  step: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

const results: VerificationResult[] = [];

function addResult(step: string, status: 'pass' | 'fail' | 'warning', message: string) {
  results.push({ step, status, message });
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  console.log(`${icon} ${step}: ${message}`);
}

async function verifyCypressSetup(): Promise<void> {
  console.log('🔍 Verifying Cypress TypeScript setup...\n');

  // 1. Check if Cypress is installed
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const hasCypress = packageJson.devDependencies?.cypress || packageJson.dependencies?.cypress;
    const hasTypes = packageJson.devDependencies?.['@types/cypress'] || packageJson.dependencies?.['@types/cypress'];

    if (hasCypress) {
      addResult('Cypress Installation', 'pass', `Cypress ${hasCypress} installed`);
    } else {
      addResult('Cypress Installation', 'fail', 'Cypress not found in package.json');
    }

    if (hasTypes) {
      addResult('Cypress Types', 'pass', `@types/cypress ${hasTypes} installed`);
    } else {
      addResult('Cypress Types', 'fail', '@types/cypress not found in package.json');
    }
  } catch (error) {
    addResult('Package.json Check', 'fail', `Failed to read package.json: ${error}`);
  }

  // 2. Check TypeScript configuration
  if (existsSync('cypress/tsconfig.json')) {
    try {
      const cypressTsConfig = JSON.parse(readFileSync('cypress/tsconfig.json', 'utf8'));
      const hasTypes = cypressTsConfig.compilerOptions?.types?.includes('cypress');
      
      if (hasTypes) {
        addResult('Cypress TypeScript Config', 'pass', 'cypress/tsconfig.json properly configured');
      } else {
        addResult('Cypress TypeScript Config', 'warning', 'Cypress types not found in tsconfig');
      }
    } catch (error) {
      addResult('Cypress TypeScript Config', 'fail', `Invalid cypress/tsconfig.json: ${error}`);
    }
  } else {
    addResult('Cypress TypeScript Config', 'fail', 'cypress/tsconfig.json not found');
  }

  // 3. Check Cypress configuration
  if (existsSync('cypress.config.ts')) {
    addResult('Cypress Config', 'pass', 'cypress.config.ts found');
  } else if (existsSync('cypress.config.js')) {
    addResult('Cypress Config', 'warning', 'Using cypress.config.js (consider upgrading to .ts)');
  } else {
    addResult('Cypress Config', 'fail', 'No cypress.config.ts or cypress.config.js found');
  }

  // 4. Check for corrupted dependencies
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const corruptedPackages = ['a', 'are', 'been', 'can', 'commands', 'direct', 'edits', 'environment', 'has', 'is', 'it', 'modify', 'only', 'our', 'prevent', 'provides', 'special', 'the', 'to', 'uninstall', 'use', 'ways', 'you'];
    
    const foundCorrupted = corruptedPackages.filter(pkg => 
      packageJson.dependencies?.[pkg] || packageJson.devDependencies?.[pkg]
    );

    if (foundCorrupted.length === 0) {
      addResult('Clean Dependencies', 'pass', 'No corrupted packages found');
    } else {
      addResult('Clean Dependencies', 'fail', `Found corrupted packages: ${foundCorrupted.join(', ')}`);
    }
  } catch (error) {
    addResult('Clean Dependencies', 'fail', `Failed to check dependencies: ${error}`);
  }

  // 5. Try to verify Cypress binary
  try {
    execSync('npx cypress verify', { stdio: 'pipe' });
    addResult('Cypress Binary', 'pass', 'Cypress binary verified successfully');
  } catch (error) {
    addResult('Cypress Binary', 'warning', 'Could not verify Cypress binary (may need to run npm install)');
  }

  // Summary
  console.log('\n📊 Summary:');
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);

  if (failed === 0) {
    console.log('\n🎉 Cypress TypeScript setup is ready!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run test:e2e');
    console.log('2. Check IntelliSense in VS Code for Cypress commands');
  } else {
    console.log('\n🔧 Issues found. Please resolve the failed checks above.');
    process.exit(1);
  }
}

verifyCypressSetup().catch(console.error);