# Homni Project Standards
## Development Guidelines Post-Architecture Maturity

### 🎯 Core Principles

#### **1. Single Source of Truth (SSOT)**
Every piece of data, logic, and configuration must have exactly one authoritative source.

```typescript
// ✅ GOOD: Single auth hook source
import { useAuth } from '@/modules/auth/hooks';

// ❌ BAD: Multiple auth imports  
import { useAuth } from '@/modules/auth/context';
import { useAuthState } from '@/hooks/useAuthState';
```

#### **2. Module-First Architecture**
All functionality organized into self-contained, pluggable modules.

```
src/modules/
├── auth/           # Authentication & authorization
├── leads/          # Lead management & distribution  
├── company/        # Company profiles & billing
├── analytics/      # Reporting & insights
├── content/        # Content management
└── system/         # Core system features
```

#### **3. Design System Consistency**
All UI components use semantic tokens from the design system.

```scss
/* ✅ GOOD: Semantic tokens */
.button {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

/* ❌ BAD: Direct colors */
.button {
  background: #3b82f6;
  color: white;
}
```

### 🏗️ Architecture Standards

#### **Database Schema**
- **RLS Enabled**: All tables must have Row-Level Security enabled
- **Audit Trails**: Critical operations logged in audit tables
- **Soft Deletes**: Use `deleted_at` timestamp instead of hard deletes
- **Consistent Naming**: snake_case for tables/columns, camelCase for TypeScript

```sql
-- ✅ GOOD: Proper table structure
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz NULL
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
```

#### **Role Management**
- **Hierarchical System**: 6-level role hierarchy enforced
- **Database-Driven**: Roles stored in `user_roles` table, not user profiles  
- **Context-Aware**: Role assignments can be scoped to specific contexts
- **Audit Logged**: All role changes tracked with challenge-response

```typescript
// ✅ GOOD: New role system
const { hasRole, canAccess } = useUnifiedRoleManagement();
if (hasRole(['admin', 'master_admin'])) {
  // Admin functionality
}

// ❌ BAD: Legacy profile.role checking
if (profile?.role === 'admin') {
  // Don't use profile.role
}
```

#### **Component Architecture**
- **Atomic Design**: Components organized by atoms → molecules → organisms
- **Single Responsibility**: Each component has one clear purpose
- **Prop Interfaces**: All components have TypeScript interfaces
- **Error Boundaries**: Wrap components with error handling

```typescript
// ✅ GOOD: Proper component structure
interface UserCardProps {
  user: UserProfile;
  onEdit?: (id: string) => void;
  variant?: 'default' | 'compact';
}

export const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  onEdit, 
  variant = 'default' 
}) => {
  // Component implementation
};
```

### 🔐 Security Standards

#### **Authentication & Authorization**
- **Supabase Auth**: Primary authentication provider
- **JWT Tokens**: Session management via Supabase
- **Role-Based Access**: All routes protected by role requirements
- **API Security**: All database access through RLS policies

#### **Data Protection**
- **Input Validation**: All user inputs validated and sanitized
- **SQL Injection Prevention**: Only parameterized queries
- **XSS Protection**: Content sanitized before rendering
- **CSRF Protection**: State validation for sensitive operations

```typescript
// ✅ GOOD: Validated API call
const createUser = async (userData: CreateUserRequest) => {
  const validated = CreateUserSchema.parse(userData);
  return supabase.from('users').insert(validated);
};

// ❌ BAD: Direct user input
const createUser = async (userData: any) => {
  return supabase.from('users').insert(userData);
};
```

### 🎨 Design System Standards

#### **Color Usage**
All colors defined as HSL semantic tokens in `index.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  /* Never use direct hex colors */
}
```

#### **Typography**
- **Font Stack**: Inter for UI, system fonts as fallback
- **Size Scale**: Tailwind's type scale (`text-sm`, `text-base`, etc.)
- **Line Heights**: Consistent leading for readability
- **Font Weights**: Limited to necessary weights (400, 500, 600)

#### **Spacing & Layout**
- **Grid System**: 4px base unit (Tailwind's default)
- **Container Sizes**: Consistent max-widths across breakpoints
- **Component Spacing**: Internal padding/margin using design tokens
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

### 📁 File Organization Standards

#### **Directory Structure**
```
src/
├── components/          # Shared UI components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components
│   └── [feature]/      # Feature-specific components
├── hooks/              # Shared React hooks
├── lib/                # Utility libraries
├── modules/            # Business logic modules
│   └── [module]/
│       ├── api/        # API functions
│       ├── components/ # Module-specific components
│       ├── hooks/      # Module-specific hooks
│       ├── types/      # TypeScript types
│       └── utils/      # Module utilities
├── pages/              # Page components
├── types/              # Global TypeScript types
└── utils/              # Global utilities
```

#### **File Naming Conventions**
- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (`useUserProfile.ts`)
- **Utilities**: camelCase (`formatCurrency.ts`)
- **Types**: PascalCase (`UserProfile.ts`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_ENDPOINTS.ts`)

### 🧪 Testing Standards

#### **Testing Strategy**
- **Unit Tests**: All utilities and hooks at >90% coverage
- **Integration Tests**: API endpoints and component interactions
- **E2E Tests**: Critical user journeys automated
- **Visual Regression**: Component visual consistency

```typescript
// ✅ GOOD: Comprehensive test
describe('useUserProfile', () => {
  it('should fetch user profile on mount', async () => {
    const { result } = renderHook(() => useUserProfile('user-id'));
    await waitFor(() => {
      expect(result.current.profile).toBeDefined();
    });
  });

  it('should handle loading states', () => {
    const { result } = renderHook(() => useUserProfile('user-id'));
    expect(result.current.isLoading).toBe(true);
  });
});
```

#### **Mock Strategy**
- **API Mocking**: MSW for API responses
- **Database Mocking**: Test fixtures for complex data
- **Component Mocking**: Mock heavy components in unit tests
- **Time Mocking**: vi.useFakeTimers for time-dependent logic

### 📚 Documentation Standards

#### **Code Documentation**
- **JSDoc Comments**: All public functions and components
- **README Files**: Each module has usage instructions
- **API Documentation**: OpenAPI spec maintained
- **Architecture Decisions**: ADRs for major changes

```typescript
/**
 * Fetches user profile with role information
 * @param userId - The unique identifier for the user
 * @returns Promise resolving to user profile with role data
 * @throws {Error} When user is not found or access denied
 * @example
 * ```typescript
 * const profile = await fetchUserProfile('123e4567-e89b-12d3-a456-426614174000');
 * console.log(profile.role); // 'admin'
 * ```
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  // Implementation
}
```

#### **Git Commit Standards**
Using Conventional Commits:

```bash
# Types: feat, fix, docs, style, refactor, test, chore
feat(auth): add role-based navigation system
fix(leads): resolve distribution algorithm edge case  
docs(api): update authentication endpoints
refactor(ui): consolidate button variants
test(roles): add role assignment integration tests
```

### 🚀 Performance Standards

#### **Bundle Size Targets**
- **Initial Bundle**: <200KB gzipped
- **Route Chunks**: <50KB per route
- **Dependencies**: Regular audit and pruning
- **Code Splitting**: Lazy load non-critical features

#### **Runtime Performance**
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s  
- **Cumulative Layout Shift**: <0.1
- **Time to Interactive**: <3s

#### **Database Performance**
- **Query Response**: <100ms p95
- **Connection Pooling**: Optimized for concurrent users
- **Index Strategy**: All frequently queried columns indexed
- **RLS Efficiency**: Policies optimized for performance

### 🔄 Deployment Standards

#### **CI/CD Pipeline**
```yaml
# Required checks before merge
checks:
  - lint: ESLint + Prettier
  - typecheck: TypeScript compilation
  - test: Unit + Integration tests  
  - security: Dependency vulnerability scan
  - performance: Bundle size analysis
  - database: Migration validation
```

#### **Environment Management**
- **Development**: Local development with hot reload
- **Staging**: Production-like environment for testing
- **Production**: Zero-downtime deployments
- **Feature Flags**: Gradual rollout capabilities

### 📊 Monitoring Standards

#### **Application Monitoring**
- **Error Tracking**: Comprehensive error logging and alerting
- **Performance Metrics**: Real-time performance monitoring
- **User Analytics**: Privacy-compliant usage tracking
- **Business Metrics**: KPI dashboards for stakeholders

#### **Infrastructure Monitoring**
- **Database Health**: Connection pools, query performance
- **API Performance**: Response times, error rates
- **Security Events**: Authentication failures, suspicious activity
- **Resource Usage**: Memory, CPU, storage utilization

---

**Document Status**: ACTIVE | **Version**: 2.0 | **Last Updated**: 2025-01-15
**Next Review**: 2025-02-15 | **Owner**: Development Team