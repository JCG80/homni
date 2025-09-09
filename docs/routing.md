# Routing Standard

This document establishes the routing standard for the Homni platform, emphasizing data-driven route configuration, role-based access control, and elimination of scattered JSX `<Route>` elements.

## Core Principles

### 1. Single Router Architecture
- **One `<BrowserRouter>`**: All routing managed through a single router instance
- **Centralized Configuration**: All routes defined in data structures, not JSX
- **Role-Based Filtering**: Routes automatically filtered based on user permissions
- **Feature Flag Support**: Routes can be conditionally enabled/disabled

### 2. No JSX Routes
**Forbidden**: Direct JSX `<Route>` elements in components
```typescript
// ❌ FORBIDDEN: JSX routes scattered throughout codebase
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}
```

**Required**: Data-driven route objects
```typescript
// ✅ REQUIRED: Route objects with metadata
export const appRoutes: AppRoute[] = [
  {
    path: '/',
    element: <HomePage />,
    roles: ['guest', 'user', 'company'],
    navKey: 'home'
  },
  {
    path: '/admin',
    element: <AdminDashboard />,
    roles: ['admin', 'master_admin'],
    navKey: 'admin.dashboard'
  }
];
```

## Route Object Structure

### AppRoute Type Definition
```typescript
export interface AppRoute {
  /** Route path (e.g., "/admin/users/:id") */
  path: string;
  
  /** Lazy-loaded React component */
  element: ReactNode;
  
  /** Whether this is an index route */
  index?: boolean;
  
  /** Nested child routes */
  children?: AppRoute[];
  
  /** Required user roles to access this route */
  roles?: UserRole[];
  
  /** Feature flag that controls route availability */
  flag?: string;
  
  /** Navigation key for menu generation */
  navKey?: string;
  
  /** Additional metadata */
  metadata?: {
    title?: string;
    description?: string;
    requiresAuth?: boolean;
    isPublic?: boolean;
  };
}
```

### Route Organization by Role

#### Guest Routes (`guestRouteObjects.ts`)
```typescript
import { lazy } from 'react';
import type { AppRoute } from './routeTypes';

const HomePage = lazy(() => import('@/pages/HomePage'));
const PropertiesPage = lazy(() => import('@/pages/PropertiesPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));

export const guestRouteObjects: AppRoute[] = [
  {
    path: '/',
    element: <HomePage />,
    roles: ['guest'],
    navKey: 'home',
    metadata: {
      title: 'Home',
      isPublic: true
    }
  },
  {
    path: '/properties',
    element: <PropertiesPage />,
    roles: ['guest'],
    navKey: 'properties'
  },
  {
    path: '/login',
    element: <LoginPage />,
    roles: ['guest'],
    navKey: 'auth.login'
  }
];
```

#### User Routes (`userRouteObjects.ts`)
```typescript
const UserDashboard = lazy(() => import('@/modules/user/pages/DashboardPage'));
const UserProperties = lazy(() => import('@/modules/user/pages/PropertiesPage'));
const UserProfile = lazy(() => import('@/modules/user/pages/ProfilePage'));

export const userRouteObjects: AppRoute[] = [
  {
    path: '/dashboard',
    element: <UserDashboard />,
    roles: ['user'],
    navKey: 'user.dashboard'
  },
  {
    path: '/properties',
    element: <UserProperties />,
    roles: ['user'],
    navKey: 'user.properties'
  },
  {
    path: '/profile',
    element: <UserProfile />,
    roles: ['user'],
    navKey: 'user.profile'
  }
];
```

#### Company Routes (`companyRouteObjects.ts`)
```typescript
const CompanyDashboard = lazy(() => import('@/modules/company/pages/DashboardPage'));
const LeadsPage = lazy(() => import('@/modules/leads/pages/LeadsPage'));
const AnalyticsPage = lazy(() => import('@/modules/analytics/pages/AnalyticsPage'));

export const companyRouteObjects: AppRoute[] = [
  {
    path: '/company',
    element: <CompanyDashboard />,
    roles: ['company'],
    navKey: 'company.dashboard'
  },
  {
    path: '/leads',
    element: <LeadsPage />,
    roles: ['company'],
    navKey: 'company.leads'
  },
  {
    path: '/analytics',
    element: <AnalyticsPage />,
    roles: ['company'],
    navKey: 'company.analytics',
    flag: 'analytics:enabled'
  }
];
```

#### Admin Routes (`adminRouteObjects.ts`)
```typescript
const AdminDashboard = lazy(() => import('@/modules/admin/pages/DashboardPage'));
const UserManagement = lazy(() => import('@/modules/admin/pages/UserManagementPage'));
const CompanyManagement = lazy(() => import('@/modules/admin/pages/CompanyManagementPage'));

export const adminRouteObjects: AppRoute[] = [
  {
    path: '/admin',
    element: <AdminDashboard />,
    roles: ['admin', 'master_admin'],
    navKey: 'admin.dashboard'
  },
  {
    path: '/admin/users',
    element: <UserManagement />,
    roles: ['admin', 'master_admin'], 
    navKey: 'admin.users'
  },
  {
    path: '/admin/companies',
    element: <CompanyManagement />,
    roles: ['admin', 'master_admin'],
    navKey: 'admin.companies'
  }
];
```

## Route Processing and Filtering

### createAppRoutes Function
```typescript
// src/routes/createAppRoutes.ts
import type { AppRoute, UserRole } from './routeTypes';
import { guestRouteObjects } from './guestRouteObjects';
import { userRouteObjects } from './userRouteObjects';
import { companyRouteObjects } from './companyRouteObjects';
import { adminRouteObjects } from './adminRouteObjects';

interface RouteConfig {
  userRole: UserRole | null;
  featureFlags: Record<string, boolean>;
  isDevelopment?: boolean;
}

export function createAppRoutes(config: RouteConfig): AppRoute[] {
  // Combine all route objects
  const allRoutes = [
    ...guestRouteObjects,
    ...userRouteObjects,
    ...companyRouteObjects,
    ...adminRouteObjects
  ];

  return allRoutes
    .filter(route => filterByRole(route, config.userRole))
    .filter(route => filterByFeatureFlag(route, config.featureFlags))
    .filter(route => filterByEnvironment(route, config.isDevelopment));
}

function filterByRole(route: AppRoute, userRole: UserRole | null): boolean {
  if (!route.roles || route.roles.length === 0) {
    return true; // No role restriction
  }
  
  if (!userRole) {
    return route.roles.includes('guest');
  }
  
  return route.roles.includes(userRole);
}

function filterByFeatureFlag(
  route: AppRoute, 
  featureFlags: Record<string, boolean>
): boolean {
  if (!route.flag) {
    return true; // No feature flag requirement
  }
  
  return featureFlags[route.flag] === true;
}

function filterByEnvironment(route: AppRoute, isDevelopment?: boolean): boolean {
  // Filter dev-only or prod-only routes if needed
  if (route.metadata?.devOnly && !isDevelopment) {
    return false;
  }
  
  return true;
}
```

### AppRouter Component
```typescript
// src/routes/AppRouter.tsx
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useFeatureFlags } from '@/modules/feature_flags/hooks/useFeatureFlags';
import { createAppRoutes } from './createAppRoutes';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function AppRouter() {
  const { user } = useAuth();
  const { flags } = useFeatureFlags();
  
  const routes = createAppRoutes({
    userRole: user?.role || null,
    featureFlags: flags,
    isDevelopment: process.env.NODE_ENV === 'development'
  });

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
            
            {/* Default redirect based on user role */}
            <Route 
              path="*" 
              element={<Navigate to={getDefaultRoute(user?.role)} replace />} 
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

function getDefaultRoute(role: UserRole | null | undefined): string {
  switch (role) {
    case 'user': return '/dashboard';
    case 'company': return '/company';
    case 'content_editor': return '/content';
    case 'admin': return '/admin';
    case 'master_admin': return '/master';
    default: return '/';
  }
}
```

## Navigation Configuration

### navConfig Structure
```typescript
// src/config/navConfig.ts
import type { UserRole } from '@/types/auth';
import { 
  HomeIcon, 
  BuildingIcon, 
  UsersIcon, 
  SettingsIcon,
  BarChart3Icon,
  FileTextIcon
} from 'lucide-react';

interface NavItem {
  key: string;
  path: string;
  label: string;
  icon: React.ComponentType;
  children?: NavItem[];
  badge?: string | number;
  disabled?: boolean;
}

export const navConfig: Record<UserRole, NavItem[]> = {
  guest: [
    {
      key: 'home',
      path: '/',
      label: 'Home',
      icon: HomeIcon
    },
    {
      key: 'properties',
      path: '/properties',
      label: 'Properties',
      icon: BuildingIcon
    },
    {
      key: 'login',
      path: '/login',
      label: 'Login',
      icon: UsersIcon
    }
  ],

  user: [
    {
      key: 'dashboard',
      path: '/dashboard',
      label: 'Dashboard',
      icon: HomeIcon
    },
    {
      key: 'properties',
      path: '/properties',
      label: 'My Properties',
      icon: BuildingIcon
    },
    {
      key: 'profile',
      path: '/profile',
      label: 'Profile',
      icon: SettingsIcon
    }
  ],

  company: [
    {
      key: 'dashboard',
      path: '/company',
      label: 'Dashboard',
      icon: HomeIcon
    },
    {
      key: 'leads',
      path: '/leads',
      label: 'Lead Inbox',
      icon: UsersIcon,
      badge: 'new'
    },
    {
      key: 'analytics',
      path: '/analytics',
      label: 'Analytics',
      icon: BarChart3Icon
    },
    {
      key: 'settings',
      path: '/company/settings',
      label: 'Settings',
      icon: SettingsIcon
    }
  ],

  content_editor: [
    {
      key: 'content',
      path: '/content',
      label: 'Content',
      icon: FileTextIcon,
      children: [
        {
          key: 'articles',
          path: '/content/articles',
          label: 'Articles',
          icon: FileTextIcon
        },
        {
          key: 'media',
          path: '/content/media',
          label: 'Media Library',
          icon: BuildingIcon
        }
      ]
    },
    {
      key: 'profile',
      path: '/profile', 
      label: 'Profile',
      icon: SettingsIcon
    }
  ],

  admin: [
    {
      key: 'admin',
      path: '/admin',
      label: 'Admin Dashboard',
      icon: HomeIcon
    },
    {
      key: 'users',
      path: '/admin/users',
      label: 'User Management',
      icon: UsersIcon
    },
    {
      key: 'companies',
      path: '/admin/companies',
      label: 'Companies',
      icon: BuildingIcon
    },
    {
      key: 'system',
      path: '/admin/system',
      label: 'System',
      icon: SettingsIcon
    }
  ],

  master_admin: [
    // Includes all admin navigation plus master-specific items
    ...navConfig.admin,
    {
      key: 'master',
      path: '/master',
      label: 'Master Control',
      icon: SettingsIcon,
      children: [
        {
          key: 'security',
          path: '/master/security',
          label: 'Security Center',
          icon: SettingsIcon
        },
        {
          key: 'performance',
          path: '/master/performance',  
          label: 'Performance',
          icon: BarChart3Icon
        }
      ]
    }
  ]
};
```

### Navigation Component
```typescript
// src/components/navigation/RoleBasedNavigation.tsx
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { navConfig } from '@/config/navConfig';
import { NavItem } from './NavItem';

interface RoleBasedNavigationProps {
  variant?: 'vertical' | 'horizontal';
  className?: string;
}

export function RoleBasedNavigation({ 
  variant = 'vertical', 
  className 
}: RoleBasedNavigationProps) {
  const { user } = useAuth();
  
  if (!user?.role) {
    return null;
  }
  
  const navigationItems = navConfig[user.role] || [];
  
  return (
    <nav className={className}>
      <ul className={variant === 'vertical' ? 'space-y-2' : 'flex space-x-4'}>
        {navigationItems.map((item) => (
          <NavItem 
            key={item.key} 
            item={item} 
            variant={variant}
          />
        ))}
      </ul>
    </nav>
  );
}
```

## Route Guards and Protection

### Route Guard Hook
```typescript
// src/routes/hooks/useRouteGuard.ts
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useFeatureFlags } from '@/modules/feature_flags/hooks/useFeatureFlags';
import type { UserRole } from '@/types/auth';

interface RouteGuardConfig {
  requiredRoles?: UserRole[];
  requiredFlags?: string[];
  requiresAuth?: boolean;
}

export function useRouteGuard(config: RouteGuardConfig) {
  const { user, isAuthenticated } = useAuth();
  const { hasFlag } = useFeatureFlags();

  // Check authentication requirement
  if (config.requiresAuth && !isAuthenticated) {
    return { canAccess: false, reason: 'authentication_required' };
  }

  // Check role requirements
  if (config.requiredRoles && config.requiredRoles.length > 0) {
    if (!user?.role || !config.requiredRoles.includes(user.role)) {
      return { canAccess: false, reason: 'insufficient_role' };
    }
  }

  // Check feature flag requirements
  if (config.requiredFlags && config.requiredFlags.length > 0) {
    for (const flag of config.requiredFlags) {
      if (!hasFlag(flag)) {
        return { canAccess: false, reason: 'feature_disabled' };
      }
    }
  }

  return { canAccess: true, reason: null };
}
```

### Protected Route Component
```typescript
// src/routes/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useRouteGuard } from '../hooks/useRouteGuard';
import type { UserRole } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
  flags?: string[];
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  roles, 
  flags, 
  fallbackPath = '/' 
}: ProtectedRouteProps) {
  const { canAccess, reason } = useRouteGuard({
    requiredRoles: roles,
    requiredFlags: flags,
    requiresAuth: true
  });

  if (!canAccess) {
    console.warn(`Route access denied: ${reason}`);
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
```

## Testing Route Configuration

### Route Testing Utilities
```typescript
// src/routes/__tests__/routeTestUtils.ts
import { createAppRoutes } from '../createAppRoutes';
import type { UserRole } from '@/types/auth';

export function getRoutesForRole(role: UserRole, flags: Record<string, boolean> = {}) {
  return createAppRoutes({
    userRole: role,
    featureFlags: flags,
    isDevelopment: false
  });
}

export function findRouteByPath(routes: AppRoute[], path: string) {
  return routes.find(route => route.path === path);
}

export function getRoutePathsForRole(role: UserRole) {
  const routes = getRoutesForRole(role);
  return routes.map(route => route.path);
}
```

### Route Access Tests
```typescript
// src/routes/__tests__/routeAccess.test.ts
import { describe, it, expect } from 'vitest';
import { getRoutesForRole, getRoutePathsForRole } from './routeTestUtils';

describe('Route Access Control', () => {
  describe('Guest routes', () => {
    it('should only have public routes', () => {
      const paths = getRoutePathsForRole('guest');
      expect(paths).toEqual(['/', '/properties', '/login']);
    });
  });

  describe('User routes', () => {
    it('should include user-specific routes', () => {
      const paths = getRoutePathsForRole('user');
      expect(paths).toContain('/dashboard');
      expect(paths).toContain('/properties');
      expect(paths).not.toContain('/admin');
    });
  });

  describe('Admin routes', () => {
    it('should include administrative routes', () => {
      const paths = getRoutePathsForRole('admin');
      expect(paths).toContain('/admin');
      expect(paths).toContain('/admin/users');
      expect(paths).toContain('/admin/companies');
    });
  });

  describe('Feature flag filtering', () => {
    it('should exclude flagged routes when flag is disabled', () => {
      const routes = getRoutesForRole('company', { 'analytics:enabled': false });
      const analyticsRoute = routes.find(r => r.path === '/analytics');
      expect(analyticsRoute).toBeUndefined();
    });

    it('should include flagged routes when flag is enabled', () => {
      const routes = getRoutesForRole('company', { 'analytics:enabled': true });
      const analyticsRoute = routes.find(r => r.path === '/analytics');
      expect(analyticsRoute).toBeDefined();
    });
  });
});
```

## Enforcement Mechanisms

### ESLint Rule for JSX Routes
```typescript
// eslint-rules/no-jsx-routes.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow JSX Route elements outside of AppRouter',
    },
  },
  create(context) {
    return {
      JSXElement(node) {
        if (
          node.openingElement.name.name === 'Route' &&
          !isInAppRouter(node, context)
        ) {
          context.report({
            node,
            message: 'Use route objects instead of JSX Route elements',
          });
        }
      },
    };
  },
};
```

### CI Validation Script
```typescript
// scripts/validateRoutes.ts
import { glob } from 'glob';
import { readFileSync } from 'fs';

function validateNoJSXRoutes() {
  const files = glob.sync('src/**/*.{ts,tsx}', { 
    ignore: ['**/AppRouter.tsx', '**/__tests__/**'] 
  });

  const violations: string[] = [];

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    
    // Check for JSX Route elements
    if (content.includes('<Route') && !file.includes('AppRouter.tsx')) {
      violations.push(`${file}: Contains JSX Route elements`);
    }
  }

  if (violations.length > 0) {
    console.error('Route standard violations found:');
    violations.forEach(v => console.error(v));
    process.exit(1);
  }

  console.log('✅ Route standards validation passed');
}

validateNoJSXRoutes();
```

## Performance Considerations

### Lazy Loading Strategy
```typescript
// Lazy load all page components
const HomePage = lazy(() => import('@/pages/HomePage'));
const DashboardPage = lazy(() => import('@/modules/user/pages/DashboardPage'));

// Preload critical routes
const preloadCriticalRoutes = () => {
  import('@/pages/HomePage');
  import('@/modules/auth/pages/LoginPage');
};

// Call during app initialization
preloadCriticalRoutes();
```

### Route Chunking
```typescript
// Vite configuration for route-based chunking
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'auth': ['src/modules/auth/**/*'],
          'admin': ['src/modules/admin/**/*'],
          'company': ['src/modules/company/**/*'],
          'user': ['src/modules/user/**/*']
        }
      }
    }
  }
});
```

This routing standard ensures consistent, maintainable, and secure routing throughout the Homni platform while providing the flexibility needed for role-based access control and feature flag management.