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
  "test:unit": "vitest run",
  "typecheck": "tsc --noEmit",
  "codemod:roles": "ts-node --transpile-only scripts/fixLegacyRoles.ts",
  "guard:legacy-roles": "ts-node --transpile-only scripts/guardLegacyRoles.ts",
  "guard:migrations": "ts-node --transpile-only scripts/guardMigrations.ts",
  "guard:rls": "ts-node scripts/checkRls.ts",
  "guard:functions": "ts-node scripts/checkFunctions.ts",
  "health:quick": "npm run typecheck && npm run build && npm run lint",
  "health:full": "npm run health:quick && npm run test:coverage && npm audit --audit-level=high || true",
  "repo:health": "ts-node scripts/repo-health.ts",
  "seed:users": "ts-node scripts/seedTestUsers.ts",
  "check:duplicates": "ts-node scripts/checkDuplicates.ts",
  "guard:required": "ts-node --transpile-only scripts/guardRequiredFiles.ts",
  "lint": "eslint --ext .js,.jsx,.ts,.tsx src",
  "lint:fix": "eslint --ext .js,.jsx,.ts,.tsx src --fix",
  "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
  "format:check": "prettier --check \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
  "e2e": "playwright test",
  "e2e:ui": "playwright test --ui",
  "migrations:down": "ts-node scripts/generateDownMigrations.ts",
  "migrations:check": "ts-node scripts/checkMigrations.ts",
  "update:supabase-imports": "node scripts/updateSupabaseImports.js",
  "types:generate": "supabase gen types typescript --project-id kkazhcihooovsuwravhs > src/integrations/supabase/types.ts"
};

// Write the updated package.json back to disk
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log('Package.json scripts updated successfully!');