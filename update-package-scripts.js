
const fs = require('fs');
const path = require('path');

// Read the package.json file
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add or update scripts
packageJson.scripts = {
  ...packageJson.scripts,
  "test": "vitest",
  "test:watch": "vitest --watch",
  "test:coverage": "vitest run --coverage",
  "typecheck": "tsc --noEmit",
  "repo:health": "ts-node scripts/repo-health.ts",
  "seed:users": "ts-node scripts/seedTestUsers.ts",
  "check:duplicates": "ts-node scripts/checkDuplicates.ts",
  "guard:rls": "ts-node scripts/checkRls.ts",
  "guard:functions": "ts-node scripts/checkFunctions.ts", 
  "guard:migrations": "ts-node scripts/checkMigrations.ts",
  "lint": "eslint --ext .js,.jsx,.ts,.tsx src",
  "lint:fix": "eslint --ext .js,.jsx,.ts,.tsx src --fix",
  "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
  "format:check": "prettier --check \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
  "e2e": "playwright test",
  "e2e:ui": "playwright test --ui",
  "deps:check": "npm ls",
  "deps:check:eslint": "npm ls @typescript-eslint/eslint-plugin @typescript-eslint/parser",
  "types:generate": "supabase gen types typescript --project-id kkazhcihooovsuwravhs > src/integrations/supabase/types.ts"
};

// Write the updated package.json back to disk
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log('Package.json scripts updated successfully!');
