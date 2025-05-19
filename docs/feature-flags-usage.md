
# Feature Flags and Module Access Usage Guide

This guide explains how to use feature flags and module access control in the application.

## Feature Flags

### What are Feature Flags?
Feature flags (also known as feature toggles) allow you to enable or disable features in your application without deploying new code. They are useful for:

- Gradual rollouts of new features
- A/B testing
- Limiting access to certain user roles
- Hiding features that are not yet complete

### Using Feature Flags in Code

#### 1. Creating a Feature Flag in the Database
```sql
INSERT INTO public.feature_flags (
  name, 
  description, 
  is_enabled, 
  percentage_rollout, 
  target_roles
) VALUES (
  'new_dashboard', 
  'New dashboard UI', 
  true, 
  50, 
  ARRAY['admin', 'premium_user']
);
```

#### 2. Using the `useFeatureFlag` Hook
```tsx
import { useFeatureFlag } from '@/modules/feature_flags/hooks/useFeatureFlag';

function MyComponent() {
  const { isEnabled, isLoading } = useFeatureFlag('new_dashboard', false);
  
  if (isLoading) return <div>Loading...</div>;
  
  return isEnabled ? (
    <div>New Dashboard Feature</div>
  ) : (
    <div>Old Dashboard Feature</div>
  );
}
```

#### 3. Using the `FeatureFlagProvider` Component
Wrap a component with `FeatureFlagProvider` to conditionally render it based on a feature flag:

```tsx
import { WithFeatureFlag } from '@/modules/feature_flags/components/FeatureFlagProvider';

function App() {
  return (
    <div>
      <WithFeatureFlag
        flagName="new_dashboard"
        fallbackComponent={<OldDashboard />}
      >
        <NewDashboard />
      </WithFeatureFlag>
    </div>
  );
}
```

## Module Access

### What is Module Access?
Module access control allows you to conditionally grant users access to specific modules in your application. This is useful for:

- Access control based on user permissions
- Enabling/disabling features for specific users
- Building a modular application with optional components

### Setting Up Module Access

#### 1. Define System Modules
```sql
INSERT INTO public.system_modules (
  name, 
  description, 
  is_active
) VALUES (
  'reporting', 
  'Advanced reporting tools', 
  true
);
```

#### 2. Granting Access to Users
```sql
-- Get the module ID
SELECT id FROM public.system_modules WHERE name = 'reporting';

-- Grant access to a user
INSERT INTO public.user_modules (
  user_id, 
  module_id, 
  is_enabled,
  settings
) VALUES (
  'user-uuid-here', 
  'module-uuid-here', 
  true,
  '{"customSetting": "value"}'::jsonb
);
```

#### 3. Using the `useModuleAccess` Hook
```tsx
import { useModuleAccess } from '@/modules/feature_flags/hooks/useModules';

function ReportingFeature() {
  const { hasAccess, isLoading } = useModuleAccess('reporting');
  
  if (isLoading) return <div>Loading...</div>;
  
  return hasAccess ? (
    <div>Reporting Module</div>
  ) : (
    <div>You don't have access to this module</div>
  );
}
```

#### 4. Getting All User Modules
```tsx
import { useUserModules } from '@/modules/feature_flags/hooks/useModules';

function UserModules() {
  const { modules, isLoading } = useUserModules();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>Your Modules</h2>
      <ul>
        {modules.map(module => (
          <li key={module.id}>
            {module.name} - {module.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Best Practices

1. Use consistent naming conventions for feature flags
2. Document all feature flags and their purpose
3. Clean up old/unused feature flags regularly
4. Use sensible defaults for fallback values
5. Add appropriate error handling when using feature flags and module access
6. Consider the performance impact of checking multiple feature flags
