#!/usr/bin/env node

/**
 * Script to add health check npm scripts to package.json
 * Run with: node scripts/add-health-scripts.js
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(process.cwd(), 'package.json');

try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add health check scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'health:dupe-checklists': 'node scripts/health/check-duplicate-checklists.js',
    'health:routes': 'node scripts/health/check-routes-and-imports.js',
    'health:docs': 'node scripts/health/check-docs-updated.js',
    'health': 'npm run health:dupe-checklists && npm run health:routes && npm run health:docs',
    'repo:health': 'npm run typecheck && npm run lint && npm run health && npm run test'
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ Added health check scripts to package.json');
  
} catch (error) {
  console.error('❌ Failed to update package.json:', error.message);
  process.exit(1);
}