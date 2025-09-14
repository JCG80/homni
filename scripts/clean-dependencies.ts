#!/usr/bin/env tsx

/**
 * Emergency Package.json Cleanup Script
 * Removes corrupted/invalid npm packages and reorganizes dependencies
 */

import { readFileSync } from 'fs';

interface PackageJson {
  name: string;
  version: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

// List of corrupted/invalid packages to remove
const CORRUPTED_PACKAGES = [
  'a', 'are', 'been', 'can', 'commands', 'direct', 'edits', 'environment',
  'has', 'is', 'it', 'modify', 'only', 'our', 'prevent', 'provides',
  'special', 'the', 'to', 'uninstall', 'use', 'ways', 'you'
];

// Packages that should be in devDependencies
const DEV_DEPENDENCIES = [
  '@playwright/test', '@testing-library/dom', '@testing-library/jest-dom',
  '@testing-library/react', '@testing-library/user-event', '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser', 'eslint-plugin-react', 'prettier', 'ts-node',
  'ts-unused-exports', 'tsx', 'vitest', 'madge', 'terser', 'sass'
];

async function analyzePackageJson(): Promise<void> {
  console.log('🔍 Analyzing package.json for cleanup...');
  
  try {
    const packageJson: PackageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    
    console.log('\n📊 Analysis Results:');
    console.log(`Total dependencies: ${Object.keys(packageJson.dependencies || {}).length}`);
    console.log(`Total devDependencies: ${Object.keys(packageJson.devDependencies || {}).length}`);
    
    // Check for corrupted packages
    const foundCorrupted = CORRUPTED_PACKAGES.filter(pkg => 
      packageJson.dependencies?.[pkg] || packageJson.devDependencies?.[pkg]
    );
    
    console.log(`\n❌ Corrupted packages found: ${foundCorrupted.length}`);
    foundCorrupted.forEach(pkg => console.log(`  - ${pkg}`));
    
    // Check for misplaced dev dependencies
    const misplacedDev = DEV_DEPENDENCIES.filter(pkg => 
      packageJson.dependencies?.[pkg]
    );
    
    console.log(`\n⚠️  Packages in wrong section: ${misplacedDev.length}`);
    misplacedDev.forEach(pkg => console.log(`  - ${pkg} (should be in devDependencies)`));
    
    console.log('\n✅ Use lov-remove-dependency to clean corrupted packages');
    console.log('✅ Run npm scripts to verify dependencies after cleanup');
    
  } catch (error) {
    console.error('❌ Failed to analyze package.json:', error);
    process.exit(1);
  }
}

analyzePackageJson();