# Development Workflow & Standards

## 🎯 Development Principles

### Core Values
- **Quality First**: Code quality over speed
- **Test-Driven**: Write tests before implementation
- **Documentation**: Code is communication
- **Security**: Security considerations in every feature
- **Performance**: Optimize for user experience

### Coding Standards
- **TypeScript Strict Mode**: No `any` types allowed
- **Functional Programming**: Prefer pure functions and immutability
- **Component Composition**: Small, focused, reusable components
- **Consistent Naming**: Clear, descriptive variable and function names

## 🔄 Git Workflow

### Branch Strategy
```
main (production)
├── develop (integration)
├── feature/user-dashboard
├── feature/lead-distribution
├── bugfix/auth-redirect
└── hotfix/security-patch
```

### Branch Naming Conventions
- `feature/<short-description>` - New features
- `bugfix/<issue-number>-<short>` - Bug fixes
- `hotfix/<critical-issue>` - Critical production fixes
- `refactor/<component-name>` - Code improvements
- `docs/<section>` - Documentation updates

### Commit Message Format
```
<type>(<scope>): <short description>

<optional body>

<optional footer>
```

#### Types
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code changes that neither fix bugs nor add features
- `test:` - Adding or updating tests
- `chore:` - Changes to build process or auxiliary tools

#### Examples
```bash
feat(auth): add passwordless login with magic links

- Implement Supabase magic link authentication
- Add email validation and rate limiting
- Update login form with new flow
- Add tests for authentication hook

Closes #123
```

### Pull Request Process

#### PR Title Format
```
<type>(<scope>): <description>
```

#### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots
(If applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Migration scripts added (if needed)
```

#### Review Requirements
- **Minimum 1 approval** for feature branches
- **Minimum 2 approvals** for main branch
- **All CI checks passing**
- **No merge conflicts**
- **Documentation updated**

## 🧪 Testing Strategy

### Testing Pyramid
```
    E2E Tests (Few)
      ↑ Slow, Expensive
   Integration Tests (Some)
      ↑ Medium Speed/Cost  
  Unit Tests (Many)
      ↑ Fast, Cheap
```

### Unit Tests (90% Coverage Target)
```typescript
// Example: Component testing
import { render, screen, fireEvent } from '@testing-library/react';
import { LeadForm } from './LeadForm';

describe('LeadForm', () => {
  it('should submit form with valid data', async () => {
    const onSubmit = jest.fn();
    render(<LeadForm onSubmit={onSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Service Type'), {
      target: { value: 'plumbing' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ service_type: 'plumbing' })
      );
    });
  });
});
```

### Integration Tests (80% Coverage Target)
```typescript
// Example: API integration testing
describe('Lead Distribution API', () => {
  it('should distribute leads to qualified companies', async () => {
    const lead = await createTestLead({ service_type: 'plumbing' });
    const companies = await createTestCompanies(2, { services: ['plumbing'] });
    
    const result = await distributeLeads([lead.id]);
    
    expect(result.assignments).toHaveLength(2);
    expect(result.assignments.every(a => a.company_id)).toBe(true);
  });
});
```

### E2E Tests (Key User Flows)
```typescript
// Example: End-to-end flow testing
import { test, expect } from '@playwright/test';

test('complete lead submission flow', async ({ page }) => {
  // Navigate to lead form
  await page.goto('/submit-lead');
  
  // Fill out form
  await page.fill('[data-testid=service-type]', 'plumbing');
  await page.fill('[data-testid=description]', 'Kitchen sink repair');
  await page.fill('[data-testid=contact-email]', 'test@example.com');
  
  // Submit form
  await page.click('[data-testid=submit-button]');
  
  // Verify success
  await expect(page.locator('[data-testid=success-message]')).toBeVisible();
});
```

## 🎨 UI/UX Standards

### Design System Usage
```typescript
// ❌ Wrong: Direct Tailwind classes
<div className="bg-blue-500 text-white p-4 rounded">
  Content
</div>

// ✅ Correct: Design system tokens
<Card className="bg-primary text-primary-foreground">
  <CardContent>Content</CardContent>
</Card>
```

### Component Structure
```typescript
// Component file structure
interface ComponentProps {
  // Props interface
}

export const Component: React.FC<ComponentProps> = ({ 
  prop1, 
  prop2 
}) => {
  // Hooks at the top
  const [state, setState] = useState();
  const { data } = useQuery();
  
  // Event handlers
  const handleAction = useCallback(() => {
    // Handler logic
  }, [dependencies]);
  
  // Early returns for loading/error states
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  // Main render
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};
```

### Accessibility Requirements
- **WCAG 2.1 AA compliance** for all components
- **Keyboard navigation** support
- **Screen reader** compatibility with ARIA labels
- **Color contrast** minimum 4.5:1 ratio
- **Focus management** for interactive elements

## 📊 Performance Standards

### Bundle Size Limits
- **Initial bundle**: < 200KB gzipped
- **Route chunks**: < 100KB gzipped
- **Component chunks**: < 50KB gzipped

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

### Optimization Techniques
```typescript
// Lazy loading for route components
const LazyDashboard = lazy(() => import('./Dashboard'));

// Memoization for expensive calculations
const ExpensiveComponent = memo(({ data }) => {
  const processed = useMemo(() => 
    expensiveCalculation(data), [data]
  );
  
  return <div>{processed}</div>;
});

// Code splitting for large libraries
const ChartComponent = lazy(() => 
  import('recharts').then(module => ({
    default: module.LineChart
  }))
);
```

## 🔒 Security Guidelines

### Input Validation
```typescript
// Always validate and sanitize user input
import { z } from 'zod';

const leadSchema = z.object({
  service_type: z.string().min(1).max(50),
  description: z.string().max(1000),
  budget_range: z.enum(['under_10k', '10k_25k', '25k_50k']),
  contact_email: z.string().email()
});

export const validateLeadInput = (input: unknown) => {
  return leadSchema.parse(input);
};
```

### Authentication Checks
```typescript
// Always verify user permissions
export const useRequireAuth = (requiredRole?: UserRole) => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (requiredRole && role !== requiredRole) {
      navigate('/unauthorized');
      return;
    }
  }, [user, role, requiredRole, navigate]);
};
```

### Data Protection
- **Never log sensitive data** (passwords, tokens, personal info)
- **Use HTTPS** for all communications
- **Sanitize all outputs** to prevent XSS
- **Validate all inputs** on client and server
- **Implement rate limiting** for API endpoints

## 📋 Code Review Checklist

### Functionality
- [ ] Code solves the intended problem
- [ ] Edge cases are handled appropriately
- [ ] Error handling is comprehensive
- [ ] Performance implications considered

### Code Quality
- [ ] Code is readable and well-structured
- [ ] Functions are small and focused
- [ ] No code duplication
- [ ] Naming is clear and consistent

### Testing
- [ ] Unit tests cover main functionality
- [ ] Integration tests for API interactions
- [ ] E2E tests for critical user flows
- [ ] Test coverage meets requirements

### Security
- [ ] Input validation implemented
- [ ] Authentication/authorization checked
- [ ] No sensitive data in logs
- [ ] SQL injection prevention measures

### Documentation
- [ ] README updated if needed
- [ ] API documentation updated
- [ ] Inline comments for complex logic
- [ ] Migration scripts documented

## 🚀 Release Process

### Version Numbering (Semantic Versioning)
- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (1.1.0): New features, backward compatible
- **PATCH** (1.1.1): Bug fixes, backward compatible

### Release Checklist
- [ ] All tests passing
- [ ] Code coverage requirements met
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Migration scripts tested
- [ ] Rollback plan prepared

### Deployment Steps
1. **Merge to main** branch
2. **Run CI/CD pipeline**
3. **Deploy to staging** environment
4. **Run smoke tests**
5. **Deploy to production**
6. **Monitor metrics** and logs
7. **Create release notes**