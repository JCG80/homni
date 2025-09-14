# Package.json Scripts Update Required

Since package.json is read-only, these scripts need to be added manually:

## Missing Scripts to Add

```json
{
  "scripts": {
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
    "check:auth-sync": "tsx scripts/check-auth-sync.ts",
    "validate:env": "tsx scripts/environment-validator.ts",
    "health:connections": "tsx scripts/connection-health-check.ts",

    // DX Utilities  
    "seed:users": "ts-node scripts/seedTestUsers.ts",
    "update:supabase-imports": "node scripts/updateSupabaseImports.js",
    "types:generate": "supabase gen types typescript --project-id ${SUPABASE_PROJECT_ID:-kkazhcihooovsuwravhs} > src/integrations/supabase/types.ts",
    "test:env": "tsx scripts/run-environment-tests.ts",
    
    // Enhanced CI/CD Scripts
    "env:check": "tsx scripts/validate-env.ts",
    "boot:smoke": "node scripts/boot-smoke.js",
    "ci:log": "tsx scripts/ci-log.ts",
    "test:e2e": "playwright test",

    // Phase complete
    "phase:complete": "npm run repo:health && echo '✅ Phase marked as SHIPPABLE'"
  }
}
```

## Status
- ✅ Environment variables standardized in critical files
- ✅ Hardcoded URLs removed from Supabase client and components
- ⚠️ Package scripts need manual addition (read-only limitation)
- ⚠️ Remaining import.meta.env cleanup needed in debug components

## Next Steps
1. Add the above scripts to package.json manually
2. Run `npm run test:env` to validate environment setup
3. Complete debug component cleanup