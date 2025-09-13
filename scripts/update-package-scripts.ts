#!/usr/bin/env ts-node

/**
 * Production-ready package.json script updater
 * Adds all necessary scripts for CI/CD, testing, and deployment
 */

import { readFileSync, writeFileSync } from 'fs';

interface PackageJson {
  name: string;
  scripts: Record<string, string>;
  [key: string]: any;
}

function updatePackageScripts() {
  console.log('📦 Updating package.json with production scripts...');
  
  try {
    const packageJson: PackageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    
    // Core production scripts
    const productionScripts = {
      ...packageJson.scripts,
      
      // Development
      "dev": "vite",
      "build": "vite build", 
      "preview": "vite preview",
      
      // Quality & Types
      "typecheck": "tsc --noEmit",
      "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
      "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
      "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
      "format:check": "prettier --check \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
      
      // Testing
      "test": "vitest",
      "test:watch": "vitest --watch", 
      "test:ui": "vitest --ui",
      "test:unit": "vitest run",
      "test:coverage": "vitest run --coverage",
      "e2e": "playwright test",
      "e2e:ui": "playwright test --ui",
      "e2e:debug": "playwright test --debug",
      
      // Health checks
      "check:duplicates": "ts-node scripts/checkDuplicates.ts",
      "check:rls": "ts-node scripts/checkRls.ts", 
      "check:functions": "ts-node scripts/checkFunctions.ts",
      "check:migrations": "ts-node scripts/checkMigrations.ts",
      "check:security": "ts-node scripts/security-check.ts",
      "guard:required": "ts-node scripts/guardRequiredFiles.ts",
      "guard:legacy-roles": "ts-node scripts/guardLegacyRoles.ts",
      "guard:rls": "ts-node scripts/checkRls.ts",
      
      // Repository health
      "repo:health": "ts-node scripts/repo-health.ts",
      "repo:validate": "npm run typecheck && npm run lint && npm run check:duplicates && npm run check:security",
      
      // Production utilities
      "seed:users": "ts-node scripts/seedTestUsers.ts",
      "types:generate": "supabase gen types typescript --project-id kkazhcihooovsuwravhs > src/integrations/supabase/types.ts",
      "migrations:check": "ts-node scripts/checkMigrations.ts",
      "migrations:generate-downs": "ts-node scripts/generateDownMigrations.ts",
      
      // CI/CD
      "ci:validate": "npm run repo:validate && npm run test:coverage && npm run build",
      "ci:test": "npm run test:unit && npm run e2e",
      "pre-deploy": "npm run ci:validate && npm run check:security",
      
      // Phase completion
      "phase:complete": "npm run repo:health && npm run pre-deploy && echo '✅ Phase marked as SHIPPABLE'"
    };
    
    // Update package.json
    const updatedPackageJson = {
      ...packageJson,
      scripts: productionScripts
    };
    
    writeFileSync('package.json', JSON.stringify(updatedPackageJson, null, 2) + '\n');
    
    console.log('✅ Package.json scripts updated successfully');
    console.log('\nProduction-ready scripts added:');
    console.log('  • Quality: typecheck, lint, format');
    console.log('  • Testing: test:coverage, e2e');
    console.log('  • Security: check:security, guard:rls');
    console.log('  • CI/CD: ci:validate, pre-deploy');
    console.log('  • Health: repo:health, check:duplicates');
    
  } catch (error) {
    console.error('❌ Failed to update package.json:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (require.main === module) {
  updatePackageScripts();
}

// Auto-run to update package.json immediately
updatePackageScripts();

export { updatePackageScripts };