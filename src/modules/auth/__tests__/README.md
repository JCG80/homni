
# Auth Testing Utilities

This directory contains utilities and tests for the authentication system in the Homni platform.

## Test Users

The system is configured with the following test users:

| Role         | Email                   | Password   |
|--------------|-------------------------|------------|
| user         | user@test.local         | Test1234!  |
| company      | company@test.local      | Test1234!  |
| admin        | admin@test.local        | Test1234!  |
| master-admin | master-admin@test.local | Test1234!  |
| provider     | provider@test.local     | Test1234!  |

## Setting up Test Users

1. Run the SQL script `src/modules/auth/__tests__/utils/create-test-users.sql` in the Supabase SQL Editor.
2. Verify that the users were created correctly.

## Development Quick Login

In development mode, you can use the `DevQuickLogin` component to quickly log in as different roles.
This component is automatically added to the application when running in development mode.

## Running Auth Tests

```bash
npx vitest run src/modules/auth/__tests__
```

## Adding New Test Users

If you need to add new test users:

1. Update the `TEST_USERS` array in `src/modules/auth/__tests__/utils/testAuth.ts`
2. Update the SQL script `src/modules/auth/__tests__/utils/create-test-users.sql`
3. Run the updated SQL script in the Supabase SQL Editor
