# UI/UX Guidelines

This document establishes user interface and user experience standards for the Homni platform, ensuring accessibility, internationalization, and consistent design patterns across all user roles.

## Design System Principles

### 1. Role-Based Design
Each user role receives a tailored experience:
- **Guest**: Marketing-focused, lead capture emphasis
- **User**: Personal dashboard, property management tools
- **Company**: Business dashboard, lead pipeline management
- **Content Editor**: Content creation and management tools
- **Admin**: System management, oversight interfaces
- **Master Admin**: Comprehensive system control panels

### 2. Accessibility First (WCAG 2.1 AA)
All interfaces must meet Web Content Accessibility Guidelines Level AA:

#### Color and Contrast
```css
/* Minimum contrast ratios */
--text-primary: hsl(0 0% 9%);     /* 16.94:1 contrast on white */
--text-secondary: hsl(0 0% 45%);   /* 4.54:1 contrast on white */
--background: hsl(0 0% 100%);
--background-secondary: hsl(0 0% 96%);

/* Never rely solely on color to convey information */
.error-state {
  color: hsl(var(--destructive));
  border-left: 4px solid hsl(var(--destructive)); /* Visual indicator */
}

.success-state::before {
  content: "✓"; /* Text indicator alongside color */
  margin-right: 0.5rem;
}
```

#### Keyboard Navigation
```typescript
// All interactive elements must be keyboard accessible
function AccessibleButton({ children, onClick, ...props }: ButtonProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(e as any);
    }
  };

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      {...props}
    >
      {children}
    </button>
  );
}
```

#### Screen Reader Support
```typescript
// Proper ARIA labels and roles
function DataTable({ data, columns }: TableProps) {
  return (
    <table role="table" aria-label="Lead management table">
      <thead>
        <tr role="row">
          {columns.map((col) => (
            <th 
              key={col.id}
              role="columnheader"
              aria-sort={col.sortDirection || 'none'}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={row.id} role="row" aria-rowindex={index + 2}>
            {/* Table cells with proper roles */}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### 3. Internationalization (i18n)

#### Language Support
- **Primary**: Norwegian (NO)
- **Secondary**: English (EN)  
- **Future**: Swedish (SE), Danish (DK)

#### Translation Structure
```typescript
// locales/no/common.json
{
  "navigation": {
    "dashboard": "Dashbord",
    "properties": "Eiendommer", 
    "leads": "Kundeforespørsler",
    "profile": "Profil"
  },
  "actions": {
    "save": "Lagre",
    "cancel": "Avbryt",
    "delete": "Slett",
    "edit": "Rediger"
  },
  "validation": {
    "required": "Dette feltet er påkrevd",
    "email": "Ugyldig e-postadresse",
    "phone": "Ugyldig telefonnummer"
  }
}

// locales/en/common.json  
{
  "navigation": {
    "dashboard": "Dashboard",
    "properties": "Properties",
    "leads": "Leads", 
    "profile": "Profile"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel", 
    "delete": "Delete",
    "edit": "Edit"
  },
  "validation": {
    "required": "This field is required",
    "email": "Invalid email address",
    "phone": "Invalid phone number"
  }
}
```

#### Translation Hook
```typescript
// hooks/useTranslation.ts
import { useContext } from 'react';
import { LanguageContext } from '@/contexts/LanguageContext';

export function useTranslation(namespace = 'common') {
  const { language, translations } = useContext(LanguageContext);
  
  const t = (key: string, params?: Record<string, string>) => {
    const keys = key.split('.');
    let value = translations[namespace];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value !== 'string') {
      console.warn(`Missing translation: ${namespace}.${key}`);
      return key;
    }
    
    // Simple parameter substitution
    if (params) {
      return Object.entries(params).reduce(
        (str, [param, val]) => str.replace(`{{${param}}}`, val),
        value
      );
    }
    
    return value;
  };
  
  return { t, language };
}

// Usage in components
function UserProfile() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('navigation.profile')}</h1>
      <button>{t('actions.save')}</button>
    </div>
  );
}
```

#### Language Switcher
```typescript
function LanguageSwitcher() {
  const { language, setLanguage } = useContext(LanguageContext);
  
  return (
    <Select value={language} onValueChange={setLanguage}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="no">
          🇳🇴 Norsk
        </SelectItem>
        <SelectItem value="en">
          🇬🇧 English
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
```

## Widget-Based Dashboard Architecture

### Dashboard Layout System
```typescript
interface DashboardWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'list' | 'form';
  title: string;
  component: React.ComponentType<any>;
  size: 'small' | 'medium' | 'large' | 'full';
  roles: UserRole[];
  flag?: string;
  order: number;
}

// Role-specific widget configurations
export const widgetConfig: Record<UserRole, DashboardWidget[]> = {
  user: [
    {
      id: 'property-overview',
      type: 'metric',
      title: 'Property Overview',
      component: PropertyOverviewWidget,
      size: 'medium',
      roles: ['user'],
      order: 1
    },
    {
      id: 'recent-leads',
      type: 'list', 
      title: 'Recent Requests',
      component: RecentLeadsWidget,
      size: 'large',
      roles: ['user'],
      order: 2
    }
  ],
  
  company: [
    {
      id: 'lead-metrics',
      type: 'metric',
      title: 'Lead Metrics',
      component: LeadMetricsWidget,
      size: 'small',
      roles: ['company'],
      order: 1
    },
    {
      id: 'lead-pipeline',
      type: 'chart',
      title: 'Lead Pipeline',
      component: LeadPipelineWidget,
      size: 'large',
      roles: ['company'],
      order: 2
    },
    {
      id: 'performance-chart',
      type: 'chart',
      title: 'Performance Analytics',
      component: PerformanceWidget,
      size: 'medium',
      roles: ['company'],
      flag: 'analytics:enabled',
      order: 3
    }
  ],
  
  admin: [
    {
      id: 'system-health',
      type: 'metric',
      title: 'System Health',
      component: SystemHealthWidget,
      size: 'small',
      roles: ['admin', 'master_admin'],
      order: 1
    },
    {
      id: 'user-activity',
      type: 'chart',
      title: 'User Activity',
      component: UserActivityWidget,
      size: 'medium',
      roles: ['admin', 'master_admin'],
      order: 2
    },
    {
      id: 'lead-control-center',
      type: 'table',
      title: 'Lead Control Center',
      component: LeadControlWidget,
      size: 'full',
      roles: ['admin', 'master_admin'],
      order: 3
    }
  ]
};
```

### Responsive Widget Grid
```typescript
function DashboardGrid({ widgets }: { widgets: DashboardWidget[] }) {
  return (
    <div className="grid gap-6 p-6">
      {/* Small widgets - 1/4 width on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets
          .filter(w => w.size === 'small')
          .sort((a, b) => a.order - b.order)
          .map(widget => (
            <WidgetContainer key={widget.id} widget={widget} />
          ))}
      </div>
      
      {/* Medium widgets - 1/2 width on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {widgets
          .filter(w => w.size === 'medium')
          .sort((a, b) => a.order - b.order)
          .map(widget => (
            <WidgetContainer key={widget.id} widget={widget} />
          ))}
      </div>
      
      {/* Large widgets - 3/4 width on desktop */}
      <div className="grid grid-cols-1 gap-6">
        {widgets
          .filter(w => w.size === 'large')
          .sort((a, b) => a.order - b.order)
          .map(widget => (
            <WidgetContainer key={widget.id} widget={widget} />
          ))}
      </div>
      
      {/* Full width widgets */}
      <div className="grid grid-cols-1 gap-6">
        {widgets
          .filter(w => w.size === 'full')
          .sort((a, b) => a.order - b.order)
          .map(widget => (
            <WidgetContainer key={widget.id} widget={widget} />
          ))}
      </div>
    </div>
  );
}
```

## Component Design Patterns

### 1. Loading States
```typescript
interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
}

function LoadingState({ isLoading, children, skeleton }: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse" aria-label="Loading content">
        {skeleton || <DefaultSkeleton />}
      </div>
    );
  }
  
  return <>{children}</>;
}

// Usage in data components
function UserProfileCard() {
  const { data: user, isLoading } = useUserProfile();
  
  return (
    <LoadingState 
      isLoading={isLoading}
      skeleton={<ProfileSkeleton />}
    >
      <Card>
        <CardHeader>
          <CardTitle>{user?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Profile content */}
        </CardContent>
      </Card>
    </LoadingState>
  );
}
```

### 2. Error States
```typescript
interface ErrorStateProps {
  error: Error | null;
  onRetry?: () => void;
  children: React.ReactNode;
}

function ErrorBoundaryWrapper({ error, onRetry, children }: ErrorStateProps) {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>
          {error.message}
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="mt-2"
            >
              Try Again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }
  
  return <>{children}</>;
}
```

### 3. Empty States
```typescript
interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Usage in list components
function LeadsList() {
  const { data: leads, isLoading } = useLeads();
  
  if (isLoading) return <LoadingSpinner />;
  
  if (!leads?.length) {
    return (
      <EmptyState
        icon={<Inbox className="h-12 w-12" />}
        title="No leads yet"
        description="Leads will appear here when customers submit requests for your services."
        action={{
          label: "Update Service Areas",
          onClick: () => navigate('/company/settings')
        }}
      />
    );
  }
  
  return (
    <div className="space-y-4">
      {leads.map(lead => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  );
}
```

## Form Design Standards

### 1. Form Validation
```typescript
// Validation schema with internationalized messages
const userProfileSchema = z.object({
  name: z.string()
    .min(1, 'validation.required')
    .max(100, 'validation.name.tooLong'),
  email: z.string()
    .email('validation.email'),
  phone: z.string()
    .regex(/^[+]?[\d\s-()]+$/, 'validation.phone')
    .optional()
});

function UserProfileForm() {
  const { t } = useTranslation();
  const form = useForm({
    resolver: zodResolver(userProfileSchema),
    defaultValues: { name: '', email: '', phone: '' }
  });
  
  const onSubmit = (data: UserProfile) => {
    // Handle form submission
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profile.name')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profile.email')}</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? t('actions.saving') : t('actions.save')}
        </Button>
      </form>
    </Form>
  );
}
```

### 2. Multi-Step Forms
```typescript
interface StepProps {
  step: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  isValid: boolean;
}

function FormStepper({ step, totalSteps, onNext, onPrevious, isValid }: StepProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              i < step ? "bg-primary text-primary-foreground" :
              i === step ? "bg-primary/20 text-primary border-2 border-primary" :
              "bg-muted text-muted-foreground"
            )}
          >
            {i + 1}
          </div>
        ))}
      </div>
      
      <div className="flex space-x-2">
        {step > 0 && (
          <Button variant="outline" onClick={onPrevious}>
            Previous
          </Button>
        )}
        <Button 
          onClick={onNext} 
          disabled={!isValid}
        >
          {step === totalSteps - 1 ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
```

## Responsive Design Standards

### 1. Breakpoint Strategy
```css
/* Mobile-first responsive design */
:root {
  --breakpoint-sm: 640px;   /* Mobile landscape */
  --breakpoint-md: 768px;   /* Tablet portrait */
  --breakpoint-lg: 1024px;  /* Tablet landscape / Small desktop */
  --breakpoint-xl: 1280px;  /* Desktop */
  --breakpoint-2xl: 1536px; /* Large desktop */
}

/* Utility classes for responsive design */
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container { max-width: 768px; }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}
```

### 2. Component Responsiveness
```typescript
// Responsive navigation component
function ResponsiveNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  
  return (
    <>
      {/* Mobile navigation */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <RoleBasedNavigation variant="vertical" />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Desktop navigation */}
      <div className="hidden lg:block">
        <RoleBasedNavigation variant="horizontal" />
      </div>
    </>
  );
}
```

## Performance Guidelines

### 1. Image Optimization
```typescript
// Optimized image component with lazy loading
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

function OptimizedImage({ src, alt, width, height, className }: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <ImageOff className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
```

### 2. Code Splitting by Role
```typescript
// Role-based lazy loading
const UserDashboard = lazy(() => 
  import('@/modules/user/pages/Dashboard').then(module => ({
    default: module.UserDashboard
  }))
);

const CompanyDashboard = lazy(() => 
  import('@/modules/company/pages/Dashboard').then(module => ({
    default: module.CompanyDashboard  
  }))
);

const AdminDashboard = lazy(() =>
  import('@/modules/admin/pages/Dashboard').then(module => ({
    default: module.AdminDashboard
  }))
);

// Dynamic dashboard loading based on role
function DashboardRouter() {
  const { user } = useAuth();
  
  const DashboardComponent = useMemo(() => {
    switch (user?.role) {
      case 'user': return UserDashboard;
      case 'company': return CompanyDashboard;
      case 'admin':
      case 'master_admin': return AdminDashboard;
      default: return null;
    }
  }, [user?.role]);
  
  if (!DashboardComponent) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardComponent />
    </Suspense>
  );
}
```

## Testing UI Components

### 1. Accessibility Testing
```typescript
// Accessibility test utilities
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('UserProfile Component', () => {
  it('should be accessible', async () => {
    const { container } = render(<UserProfile user={mockUser} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should support keyboard navigation', () => {
    render(<UserProfile user={mockUser} />);
    
    const editButton = screen.getByRole('button', { name: /edit profile/i });
    editButton.focus();
    
    expect(editButton).toHaveFocus();
    
    // Test keyboard activation
    fireEvent.keyDown(editButton, { key: 'Enter' });
    expect(mockOnEdit).toHaveBeenCalled();
  });
  
  it('should have proper ARIA labels', () => {
    render(<UserProfile user={mockUser} />);
    
    expect(screen.getByRole('img')).toHaveAccessibleName(mockUser.name);
    expect(screen.getByRole('main')).toHaveAccessibleName('User profile');
  });
});
```

### 2. Responsive Testing
```typescript
// Responsive design testing
describe('Responsive Navigation', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });
  
  it('should show desktop navigation on large screens', () => {
    render(<ResponsiveNavigation />);
    
    expect(screen.getByTestId('desktop-nav')).toBeVisible();
    expect(screen.queryByTestId('mobile-menu-button')).not.toBeInTheDocument();
  });
  
  it('should show mobile menu button on small screens', () => {
    Object.defineProperty(window, 'innerWidth', { value: 640 });
    window.dispatchEvent(new Event('resize'));
    
    render(<ResponsiveNavigation />);
    
    expect(screen.getByTestId('mobile-menu-button')).toBeVisible();
    expect(screen.queryByTestId('desktop-nav')).not.toBeInTheDocument();
  });
});
```

These UI/UX guidelines ensure the Homni platform provides an accessible, internationalized, and consistent user experience across all roles and devices while maintaining high performance and usability standards.