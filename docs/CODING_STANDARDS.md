# Coding Standards

This document establishes coding standards and best practices for the Homni platform to ensure consistent, maintainable, and high-quality code across all modules.

## TypeScript Standards

### Type Safety Requirements
- **Strict Mode**: All TypeScript files must compile with `strict: true`
- **No `any` Types**: Explicitly forbidden except in legacy migration scenarios
- **Explicit Return Types**: All public functions must have explicit return type annotations
- **Null Safety**: Use strict null checks, prefer optional chaining and nullish coalescing

```typescript
// ✅ Good: Explicit types and null safety
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const response = await api.get(`/users/${userId}`);
  return response.data?.profile ?? null;
}

// ❌ Bad: Any types and implicit returns
function fetchUserProfile(userId: any) {
  return api.get(`/users/${userId}`);
}
```

### Common TypeScript Error Solutions

#### Problem: TS1261 - Already included file name casing
```typescript
// ❌ Problematic: Mixed casing in same project
import { MainRoutes } from './MainRoutes'; // File: MainRoutes.tsx
import { mainRoutes } from './mainRoutes'; // File: mainRoutes.tsx

// ✅ Solution: Consistent casing
import { AppRoutes } from './AppRoutes'; // File: AppRoutes.tsx
import { routeConfig } from './routeConfig'; // File: routeConfig.ts
```

#### Problem: "Object is possibly undefined"
```typescript
// ❌ Problematic
const userName = user.profile.name; // Error if profile is optional

// ✅ Solution 1: Optional chaining
const userName = user.profile?.name;

// ✅ Solution 2: Type guard
function hasProfile(user: User): user is User & { profile: Profile } {
  return user.profile != null;
}

if (hasProfile(user)) {
  const userName = user.profile.name; // Safe access
}

// ✅ Solution 3: Default values
const userName = user.profile?.name ?? 'Unknown User';
```

### Interface vs Type Guidelines
- **Interfaces**: For object shapes that might be extended
- **Types**: For unions, primitives, and computed types

```typescript
// ✅ Use interfaces for extendable object shapes
interface BaseUser {
  id: string;
  name: string;
}

interface AdminUser extends BaseUser {
  permissions: string[];
}

// ✅ Use types for unions and computed types
type UserRole = 'guest' | 'user' | 'company' | 'admin' | 'master_admin';
type UserWithRole = BaseUser & { role: UserRole };
```

## Component Standards

### Component Structure
```typescript
// ✅ Standard component structure
interface ComponentProps {
  // Props interface always defined
  title: string;
  onAction?: () => void;
  variant?: 'primary' | 'secondary';
}

export function MyComponent({ 
  title, 
  onAction, 
  variant = 'primary' 
}: ComponentProps) {
  // Hooks at the top
  const [loading, setLoading] = useState(false);
  const { data } = useQuery(['key'], fetcher);
  
  // Event handlers
  const handleClick = useCallback(() => {
    onAction?.();
  }, [onAction]);
  
  // Render
  return (
    <div className={cn('base-styles', variant === 'primary' && 'primary-styles')}>
      <h2>{title}</h2>
      <button onClick={handleClick} disabled={loading}>
        Action
      </button>
    </div>
  );
}
```

### Component Size Limits
- **Maximum 150 lines per component file**
- **Break down large components into smaller, focused components**
- **Extract complex logic into custom hooks**

```typescript
// ❌ Too large: 200+ line component
function LargeUserProfile() {
  // ... 200+ lines of mixed concerns
}

// ✅ Better: Broken into focused components
function UserProfile() {
  return (
    <div>
      <UserAvatar />
      <UserDetails />
      <UserActions />
    </div>
  );
}

function UserAvatar() {
  // ... avatar-specific logic
}

function UserDetails() {
  // ... details-specific logic
}

function UserActions() {
  // ... actions-specific logic
}
```

### Prop Validation
```typescript
// ✅ Always define prop interfaces with proper typing
interface ButtonProps {
  children: React.ReactNode;
  variant: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// ✅ Use default parameters for optional props
export function Button({ 
  children, 
  variant, 
  size = 'md', 
  disabled = false, 
  onClick 
}: ButtonProps) {
  // Implementation
}
```

## File and Folder Naming

### Naming Conventions
- **Files**: PascalCase for components (`UserProfile.tsx`), camelCase for utilities (`dateUtils.ts`)
- **Folders**: kebab-case for modules (`user-management`), camelCase for feature folders (`userProfiles`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`)
- **Functions**: camelCase (`getUserProfile`)
- **Classes**: PascalCase (`UserProfileService`)

```typescript
// ✅ Consistent naming
src/
  modules/
    user-management/          // kebab-case for modules
      components/
        UserProfile.tsx       // PascalCase for components
        ProfileForm.tsx
      utils/
        userUtils.ts          // camelCase for utilities
        dateHelpers.ts
      constants/
        API_ENDPOINTS.ts      // SCREAMING_SNAKE_CASE for constants
```

### Import/Export Standards
```typescript
// ✅ Explicit named exports
export function UserProfile() { }
export function ProfileForm() { }

// ✅ Barrel exports for modules
// src/modules/user/index.ts
export { UserProfile } from './components/UserProfile';
export { ProfileForm } from './components/ProfileForm';
export { userUtils } from './utils/userUtils';

// ✅ Import organization
import React from 'react';                    // External libraries first
import { toast } from 'sonner';

import { Button } from '@/components/ui';     // Internal UI components
import { UserProfile } from '@/modules/user'; // Feature modules
import { cn } from '@/utils';                 // Utilities last
```

## Error Handling Standards

### API Error Handling
```typescript
// ✅ Structured error handling with types
interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

async function fetchUserData(userId: string): Promise<User | null> {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`API Error: ${error.code} - ${error.message}`);
      toast.error(error.message);
    } else {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    }
    return null;
  }
}
```

### Component Error Boundaries
```typescript
// ✅ Error boundaries for component trees
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ModuleErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Module error:', error, errorInfo);
    // Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <ModuleErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

## Testing Standards

### Test File Organization
```
src/modules/user/
  components/
    UserProfile.tsx
    __tests__/
      UserProfile.test.tsx
  utils/
    userUtils.ts
    __tests__/
      userUtils.test.ts
```

### Test Naming Conventions
```typescript
// ✅ Descriptive test names
describe('UserProfile Component', () => {
  describe('when user has complete profile', () => {
    it('should display all user information correctly', () => {
      // Test implementation
    });
    
    it('should enable edit button for profile owner', () => {
      // Test implementation
    });
  });

  describe('when user profile is incomplete', () => {
    it('should show completion prompt', () => {
      // Test implementation
    });
  });

  describe('error states', () => {
    it('should handle network errors gracefully', () => {
      // Test implementation
    });
  });
});
```

### Mock Standards
```typescript
// ✅ Consistent mocking patterns
const mockUserProfile = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com'
} as const;

// ✅ Mock hooks consistently
jest.mock('@/hooks/useUserProfile', () => ({
  useUserProfile: jest.fn(() => ({
    data: mockUserProfile,
    loading: false,
    error: null
  }))
}));
```

## Database & API Standards

### Query Patterns
```typescript
// ✅ Consistent query key patterns
const userQueries = {
  all: () => ['users'] as const,
  lists: () => [...userQueries.all(), 'list'] as const,
  list: (filters: UserFilters) => [...userQueries.lists(), filters] as const,
  details: () => [...userQueries.all(), 'detail'] as const,
  detail: (id: string) => [...userQueries.details(), id] as const,
};

// ✅ Usage in components
function useUserProfile(userId: string) {
  return useQuery({
    queryKey: userQueries.detail(userId),
    queryFn: () => fetchUserProfile(userId),
  });
}
```

### RLS Policy Patterns
```sql
-- ✅ Consistent RLS policy naming and structure
CREATE POLICY "users_select_own_profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "users_update_own_profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- ✅ Admin access patterns
CREATE POLICY "admins_select_all_profiles" 
ON user_profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.user_id = auth.uid() 
    AND up.role IN ('admin', 'master_admin')
  )
);
```

## Performance Standards

### React Performance
```typescript
// ✅ Proper memoization
const ExpensiveComponent = memo(({ data, onUpdate }: Props) => {
  const processedData = useMemo(() => 
    expensiveCalculation(data), 
    [data]
  );
  
  const handleUpdate = useCallback((newData: Data) => {
    onUpdate(newData);
  }, [onUpdate]);
  
  return <div>{/* Component content */}</div>;
});

// ✅ Lazy loading for routes
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
```

### Bundle Size Optimization
```typescript
// ✅ Tree-shakable imports
import { Button } from '@/components/ui/button';

// ❌ Avoid barrel imports for large libraries
import { Button } from '@/components/ui'; // Imports entire UI library

// ✅ Dynamic imports for large dependencies
async function handleExportData() {
  const { saveAs } = await import('file-saver');
  const { utils } = await import('xlsx');
  // Use libraries
}
```

## Security Standards

### Input Validation
```typescript
// ✅ Validate all user inputs
import { z } from 'zod';

const UserProfileSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().min(0).max(120).optional()
});

function validateUserProfile(data: unknown): UserProfile | null {
  const result = UserProfileSchema.safeParse(data);
  return result.success ? result.data : null;
}
```

### Safe API Calls
```typescript
// ✅ Never trust client-side data
async function updateUserProfile(profileData: UserProfile) {
  // Server validates again
  const response = await api.post('/users/profile', profileData);
  
  if (!response.ok) {
    throw new ApiError(response.statusText, response.status);
  }
  
  return response.data;
}
```

## Documentation Standards

### JSDoc Requirements
```typescript
/**
 * Fetches user profile data with caching and error handling
 * 
 * @param userId - The unique identifier for the user
 * @param options - Configuration options for the request
 * @returns Promise resolving to user profile or null if not found
 * 
 * @example
 * ```typescript
 * const profile = await fetchUserProfile('user123', { includeAvatar: true });
 * if (profile) {
 *   console.log(profile.name);
 * }
 * ```
 */
async function fetchUserProfile(
  userId: string, 
  options: FetchOptions = {}
): Promise<UserProfile | null> {
  // Implementation
}
```

### README Requirements
Each module must include:
- **Purpose**: What the module does
- **Key Features**: Main capabilities
- **Usage Examples**: How to use the module
- **API Reference**: Public functions and components
- **Testing**: How to run tests
- **Dependencies**: External dependencies and peer dependencies

## Code Quality Tools

### Required Tools
- **ESLint**: Code linting with TypeScript rules
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Vitest**: Unit testing
- **Playwright**: E2E testing

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

### CI Requirements
All code must pass:
- `npm run lint` - No linting errors
- `npm run typecheck` - No TypeScript errors  
- `npm run test` - ≥90% test coverage
- `npm run build` - Successful production build

These standards ensure consistency, maintainability, and quality across the entire Homni codebase. All developers must follow these guidelines, and they are enforced through automated tooling and code review processes.