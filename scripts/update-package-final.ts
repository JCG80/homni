#!/usr/bin/env ts-node

/**
 * Final package.json cleanup script for HOMNI platform
 * Removes invalid dependencies and ensures proper structure
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface PackageJson {
  name: string;
  version: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: any;
}

function cleanPackageJson() {
  const packagePath = join(process.cwd(), 'package.json');
  
  try {
    const content = readFileSync(packagePath, 'utf8');
    const pkg: PackageJson = JSON.parse(content);
    
    // List of invalid single-word dependencies that should be removed
    const invalidDeps = [
      'a', 'are', 'been', 'can', 'commands', 'direct', 'edits', 
      'environment', 'has', 'is', 'it', 'modify', 'only', 'our', 
      'prevent', 'provides', 'special', 'the', 'to', 'uninstall', 
      'use', 'ways', 'you'
    ];
    
    let cleaned = false;
    
    // Remove invalid dependencies
    for (const dep of invalidDeps) {
      if (pkg.dependencies[dep]) {
        delete pkg.dependencies[dep];
        cleaned = true;
        console.log(`Removed invalid dependency: ${dep}`);
      }
    }
    
    // Ensure critical scripts exist
    const requiredScripts = {
      'typecheck': 'tsc --noEmit',
      'test': 'vitest run',
      'test:coverage': 'vitest run --coverage',
      'test:watch': 'vitest',
      'e2e': 'playwright test',
      'lint:fix': 'eslint . --fix',
      'format': 'prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,md}"',
      'format:check': 'prettier --check "src/**/*.{js,jsx,ts,tsx,json,css,md}"'
    };
    
    for (const [script, command] of Object.entries(requiredScripts)) {
      if (!pkg.scripts[script]) {
        pkg.scripts[script] = command;
        cleaned = true;
        console.log(`Added missing script: ${script}`);
      }
    }
    
    if (cleaned) {
      writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
      console.log('✅ Package.json cleaned successfully');
    } else {
      console.log('✅ Package.json is already clean');
    }
    
  } catch (error) {
    console.error('❌ Error cleaning package.json:', error);
    process.exit(1);
  }
}

cleanPackageJson();