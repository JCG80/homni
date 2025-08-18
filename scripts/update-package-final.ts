#!/usr/bin/env ts-node

/**
 * Update package.json with all required health check scripts
 */

import { readFileSync, writeFileSync } from 'fs';

const packageJsonPath = 'package.json';
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

// Add comprehensive script collection
const newScripts = {
  ...packageJson.scripts,
  "test:unit": "vitest run",
  "test:e2e": "playwright test",
  "test:cypress": "cypress run",
  "test:marketplace": "ts-node scripts/test-marketplace.ts",
  "test:coverage": "vitest run --coverage",
  "guard:legacy-roles": "node scripts/guardLegacyRoles.js",
  "guard:required": "ts-node --transpile-only scripts/guardRequiredFiles.ts",
  "guard:rls": "node scripts/guardRls.js",
  "guard:functions": "node scripts/guardFunctions.js", 
  "guard:migrations": "node scripts/guardMigrations.js",
  "guard:marketplace": "ts-node scripts/test-marketplace.ts",
  "check:duplicates": "node scripts/checkDuplicates.js",
  "repo:health": "npm run typecheck && npm run build && npm run test:unit && npm run check:duplicates && npm run guard:legacy-roles && npm run guard:rls && npm run guard:functions && npm run guard:migrations",
  "phase:complete": "npm run repo:health && echo '✅ Phase marked as SHIPPABLE'"
};

packageJson.scripts = newScripts;

writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('✅ Updated package.json with comprehensive health check scripts');