# Authentication System Documentation

## Overview

This application implements a comprehensive authentication and authorization system with specialized developer tools for testing in development environments.

## Authentication Methods

### 1. Regular Authentication

In production, users authenticate via:
- Email/password login
- Session management through Supabase Auth

### 2. Development Authentication Tools

When in development mode (`import.meta.env.MODE === 'development'`), the following tools are available:

#### Quick Role-Based Login

Located at the bottom-right corner of the screen, these buttons allow instant login as specific roles:
- "Login as User" - For testing user-specific features
- "Login as Provider" - For testing provider-specific features
- "Login as Admin" - For testing admin features
- "Login as Master Admin" - For testing master admin features

These buttons call the `devLoginAs(role)` function which automatically selects an appropriate test user with that role.

#### Quick Dev Login Dropdown

A dropdown menu showing all available test users with:
- User name
- Role indicator
- One-click login for specific test users

## Route Protection System

### Types of Protected Routes

1. **Any Authenticated User Routes**
   - Protected by: `<ProtectedRoute allowAnyAuthenticated={true}>`
   - Requirement: Any valid user session
   - Example: `/leads/test`
   - Usage: Test pages, general authenticated features

2. **Role-Specific Routes**
   - Protected by: `<ProtectedRoute allowedRoles={['admin', 'master-admin']}>`
   - Requirement: User must have one of the specified roles
   - Example: Administrative pages with role restrictions
   - Usage: Feature-specific pages where role matters

3. **General Authenticated Routes**
   - Protected by: `<Authenticated>` component
   - Requirement: Valid authentication
   - Example: Most application routes
   - Usage: Default protection for most pages

### Implementation in Routes.tsx

Routes are configured using a `routesConfig` array with properties:
- `path`: URL path
- `element`: React component to render
- `requiresAuth`: Whether authentication is required
- `roles`: Array of allowed roles (optional)
- `allowAnyRole`: Boolean to allow any authenticated user regardless of role

## Adding Test Users

1. **Database Setup**

Add users to your Supabase database:

```sql
-- Add test user
INSERT INTO auth.users (id, email, password, raw_user_meta_data)
VALUES (gen_random_uuid(), 'newrole@test.local', crypt('password','generated_salt'), '{"role":"new-role"}')
ON CONFLICT DO NOTHING;

-- Add profile
INSERT INTO user_profiles (id, full_name)
SELECT id, 'New Role User' FROM auth.users WHERE email = 'newrole@test.local'
ON CONFLICT DO NOTHING;
```

2. **Application Setup**

Update the `TEST_USERS` array in `src/modules/auth/utils/devLogin.ts`:

```typescript
export const TEST_USERS: TestUser[] = [
  // Existing users...
  { email: 'newrole@test.local', role: 'new-role', name: 'New Role User' }
];
```

3. **Add New Role Type** (if required)

If adding a new role type, update the `UserRole` type in `src/modules/auth/types/types.ts`:

```typescript
export type UserRole = 'user' | 'company' | 'admin' | 'master-admin' | 'provider' | 'new-role';
```

## Troubleshooting Authentication

### Common Issues

1. **Login Not Working**
   - Check console logs for auth errors
   - Verify test user exists in database
   - Ensure password is 'password' for test users

2. **Route Access Denied**
   - Check console logs for role verification
   - Verify user has correct role assigned
   - Check route configuration in Routes.tsx

3. **Authentication State Problems**
   - Verify `authState` is correctly populated
   - Check that `useAuth()` is returning expected values
