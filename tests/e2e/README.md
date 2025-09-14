# E2E Tests with Playwright

This directory contains end-to-end tests using Playwright with proper TypeScript configuration.

## Test Structure

```
tests/e2e/
├── auth.spec.ts              # Authentication flow tests
├── leads.spec.ts             # Lead management tests
├── marketplace.spec.ts       # Marketplace functionality tests
├── role_switch.spec.ts       # Role switching tests
├── admin_menu_visibility.spec.ts  # Admin menu visibility tests
├── advanced-lead-search.spec.ts   # Advanced search functionality
└── README.md                 # This file
```

## TypeScript Configuration

All test files now use proper TypeScript typing:

```typescript
import { test, expect, type Page } from '@playwright/test';

test('test name', async ({ page }: { page: Page }) => {
  // Test implementation
});
```

## Key Features

- ✅ Proper TypeScript types for all test functions
- ✅ Clean imports without module resolution errors
- ✅ Consistent test structure across all files
- ✅ Separate TypeScript config (`tsconfig.e2e.json`)
- ✅ Integration with CI/CD pipeline

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with browser UI
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test auth.spec.ts
```

## Configuration Files

- `playwright.config.ts` - Main Playwright configuration
- `tsconfig.e2e.json` - TypeScript config for E2E tests
- `tsconfig.json` - Main TypeScript config (includes reference to e2e config)

## Test Development Guidelines

1. Always use explicit Page typing: `({ page }: { page: Page })`
2. Import types properly: `import { test, expect, type Page } from '@playwright/test'`
3. Follow consistent naming: `*.spec.ts` for test files
4. Group related tests in describe blocks
5. Use meaningful test descriptions
6. Add proper error handling and assertions