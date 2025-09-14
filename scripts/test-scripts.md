# Test Scripts Configuration

Since package.json cannot be directly modified, add these scripts to your package.json:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:ui": "playwright test --ui",
    "test:unit": "vitest",
    "test:unit:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:all": "npm run test:unit && npm run test:e2e",
    "type-check": "tsc --noEmit",
    "type-check:e2e": "tsc -p tsconfig.e2e.json --noEmit"
  }
}
```

## Running Tests

After adding these scripts, you can run:

- `npm run test:e2e` - Run all Playwright E2E tests
- `npm run test:e2e:headed` - Run tests with browser UI visible
- `npm run test:e2e:debug` - Run tests in debug mode
- `npm run test:unit` - Run Vitest unit tests
- `npm run test:all` - Run both unit and E2E tests
- `npm run type-check` - Check TypeScript types for main project
- `npm run type-check:e2e` - Check TypeScript types for E2E tests

## Installation Commands

If Playwright is not installed or needs reinstalling:

```bash
npm install --save-dev @playwright/test@latest
npx playwright install --with-deps
```