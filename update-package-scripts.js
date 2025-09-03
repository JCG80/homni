const fs = require('fs');
const path = require('path');

// Read the package.json file
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add comprehensive script collection
packageJson.scripts = {
  ...packageJson.scripts,
  // Core
  "dev": packageJson.scripts?.dev || "vite",
  "build": packageJson.scripts?.build || "vite build",
  "preview": packageJson.scripts?.preview || "vite preview",

  // Quality & Types
  "typecheck": "tsc --noEmit",
  "lint": "eslint --ext .js,.jsx,.ts,.tsx src",
  "lint:fix": "eslint --ext .js,.jsx,.ts,.tsx src --fix",
  "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
  "format:check": "prettier --check \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",

  // Tests
  "test": "vitest",
  "test:watch": "vitest --watch",
  "test:unit": "vitest run",
  "test:coverage": "vitest run --coverage",
  "e2e": "playwright test",
  "e2e:ui": "playwright test --ui",

  // Guards & Health
  "check:duplicates": "ts-node scripts/checkDuplicates.ts",
  "guard:required": "ts-node --transpile-only scripts/guardRequiredFiles.ts",
  "guard:legacy-roles": "ts-node --transpile-only scripts/guardLegacyRoles.ts",
  "guard:rls": "ts-node scripts/checkRls.ts",
  "guard:functions": "ts-node scripts/checkFunctions.ts",
  "guard:migrations": "ts-node scripts/checkMigrations.ts",
  "migrations:check": "ts-node scripts/checkMigrations.ts",
  "migrations:generate-downs": "ts-node scripts/generateDownMigrations.ts",
  "repo:health": "ts-node scripts/repo-health.ts",

  // DX Utilities
  "seed:users": "ts-node scripts/seedTestUsers.ts",
  "update:supabase-imports": "node scripts/updateSupabaseImports.js",
  "types:generate": "supabase gen types typescript --project-id kkazhcihooovsuwravhs > src/integrations/supabase/types.ts",

  // Phase complete
  "phase:complete": "npm run repo:health && echo '✅ Phase marked as SHIPPABLE'"
};

// Write the updated package.json back to disk
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log('Package.json scripts updated successfully!');