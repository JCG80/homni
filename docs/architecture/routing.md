# Route Objects Standard

## Overview

This document describes the Route Objects Standard used in the Homni platform. This standard ensures consistent, maintainable, and feature-flag-aware routing throughout the application.

## Why Route Objects?

Instead of using JSX `<Route>` arrays scattered throughout the codebase, we use data-driven route objects that provide:

- **Feature Flag Support**: Routes can be conditionally enabled/disabled
- **Role-Based Access**: Routes are filtered based on user roles
- **Lazy Loading**: All page components are lazy-loaded for better performance
- **Type Safety**: Full TypeScript support with the `AppRoute` type
- **Maintainability**: Single source of truth for route configuration

## Route Object Structure

```typescript
export type AppRoute = {
  path: string;              // Route path (e.g., "/kategori/:slug")
  element: ReactNode;        // Lazy-loaded component
  index?: boolean;           // Optional index route
  children?: AppRoute[];     // Nested routes
  roles?: UserRole[];        // Allowed user roles
  flag?: string;             // Feature flag key
  navKey?: string;           // Navigation menu key
};
```

## Example Usage

### Defining Route Objects

```typescript
// src/routes/mainRouteObjects.ts
import { lazy } from 'react';
import type { AppRoute } from './routeTypes';

const HomePage = lazy(() => import('@/pages/HomePage'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));

export const mainRouteObjects: AppRoute[] = [
  {
    path: '/',
    element: <HomePage />,
    roles: ['anonymous', 'user', 'company'],
    navKey: 'home'
  },
  {
    path: '/kategori/:slug',
    element: <CategoryPage />,
    roles: ['anonymous', 'user', 'company'],
    flag: 'categories:enabled',
    navKey: 'categories'
  }
];
```

### Filtering Routes

Routes are automatically filtered by the `AppRouter` component using:

```typescript
import { applyFeatureFlags } from './filters';

const filteredRoutes = applyFeatureFlags(allRoutes, flags, userRole);
```

## File Organization

- `src/routes/routeTypes.ts` - Type definitions
- `src/routes/filters.ts` - Route filtering logic
- `src/routes/AppRouter.tsx` - Main router component
- `src/routes/*RouteObjects.ts` - Route object definitions
- `src/routes/__tests__/` - Route tests

## Adding New Routes

1. **Create Route Objects**: Add your routes to the appropriate `*RouteObjects.ts` file
2. **Lazy Load Components**: Use `lazy()` for all page components
3. **Set Roles**: Define which user roles can access the route
4. **Feature Flags**: Add a feature flag if the route is experimental
5. **Tests**: Add E2E tests for the new routes

## Feature Flags

Routes can be conditionally enabled using feature flags:

```typescript
{
  path: '/beta-feature',
  element: <BetaPage />,
  flag: 'beta:newFeature',
  roles: ['user']
}
```

The route will only be available if the `beta:newFeature` flag is enabled.

## Role-Based Access

Routes are filtered based on user roles:

- `anonymous` - Unauthenticated users
- `user` - Regular authenticated users
- `company` - Company users
- `content_editor` - Content editors
- `admin` - Administrators
- `master_admin` - Super administrators

## Performance

- **Lazy Loading**: All page components are lazy-loaded using React's `lazy()`
- **Suspense**: Loading states are handled by Suspense boundaries
- **Code Splitting**: Routes are automatically split into separate chunks

## Enforcement

The Route Objects Standard is enforced through:

1. **ESLint Rules**: Prevent JSX `<Route>` usage outside of `AppRouter`
2. **Repo Health Checks**: CI script validates compliance
3. **Type Safety**: TypeScript ensures proper route object structure

## Migration Guide

To migrate from JSX routes to route objects:

1. **Convert JSX to Objects**: Replace `<Route>` elements with `AppRoute` objects
2. **Add Lazy Loading**: Wrap components with `lazy()`
3. **Set Roles**: Define appropriate role restrictions
4. **Update Imports**: Import from route object files instead of JSX files
5. **Test**: Run E2E tests to ensure routes work correctly

## Testing

Routes are tested at multiple levels:

- **Unit Tests**: Route filtering logic
- **Integration Tests**: Route registration and navigation
- **E2E Tests**: Full user journeys through routes
- **Accessibility Tests**: Keyboard navigation and screen reader support

## Best Practices

1. **Keep Routes Data-Driven**: Never use JSX routes outside of `AppRouter`
2. **Use Lazy Loading**: All page components should be lazy-loaded
3. **Set Appropriate Roles**: Restrict routes based on user permissions
4. **Use Feature Flags**: Gate experimental routes behind flags
5. **Test Thoroughly**: Add E2E tests for all new routes
6. **Document Changes**: Update this document when adding new patterns

## Performance Budgets

- Route navigation should complete within 3 seconds
- Lazy-loaded components should not exceed 500KB per chunk
- Initial route bundle should be under 200KB gzipped