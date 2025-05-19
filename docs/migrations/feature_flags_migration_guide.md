
# Feature Flags & Module Management Migration Guide

This document outlines the process for implementing the feature flags and module management system. It provides a step-by-step guide for safely applying database migrations, updating TypeScript types, and verifying the changes.

## Migration Steps

### 1. Preparation

- Review the existing schema and functionality
- Identify potential impacts on existing code
- Ensure you have admin access to the Supabase project

### 2. Backup

Before making any changes, create a database backup:

```bash
supabase db dump --db-url $SUPABASE_DB_URL > backup_$(date +%Y%m%d).sql
```

If you don't have the DB URL, retrieve it from the Supabase dashboard or ask your administrator.

### 3. Apply SQL Migrations

The migrations are organized into four files:

1. `20250519_add_feature_modules.sql` - Creates the new tables
2. `20250519_alter_existing_tables.sql` - Alters existing tables
3. `20250519_add_rls_policies.sql` - Adds RLS policies
4. `20250519_add_helper_functions.sql` - Creates helper functions

Run the migrations:

```bash
# Apply all migrations
supabase migration up --db-url $SUPABASE_DB_URL

# Or apply specific migrations
supabase migration up 20250519_add_feature_modules.sql --db-url $SUPABASE_DB_URL
supabase migration up 20250519_alter_existing_tables.sql --db-url $SUPABASE_DB_URL
supabase migration up 20250519_add_rls_policies.sql --db-url $SUPABASE_DB_URL
supabase migration up 20250519_add_helper_functions.sql --db-url $SUPABASE_DB_URL
```

### 4. Regenerate TypeScript Types

```bash
npx supabase gen types typescript --project-id kkazhcihooovsuwravhs > src/integrations/supabase/types.ts
```

Verify that the new types are available:

```typescript
import { Database } from '@/integrations/supabase/types';

// Check that these types exist
type FeatureFlags = Database['public']['Tables']['feature_flags']['Row'];
type UserModules = Database['public']['Tables']['user_modules']['Row'];
```

### 5. Initial Data Population

After applying the migrations, populate some initial data:

```sql
-- Insert feature flags
INSERT INTO public.feature_flags (name, description, is_enabled, target_roles)
VALUES 
  ('new_kanban_ui', 'New Kanban UI Experience', false, '{admin}'),
  ('advanced_filtering', 'Advanced filtering options', false, NULL),
  ('analytics_dashboard', 'Analytics Dashboard', false, '{admin,master_admin}');

-- Update system modules to link with feature flags
UPDATE public.system_modules
SET feature_flags_enabled = true, 
    extended_metadata = jsonb_build_object('related_flags', jsonb_build_array('new_kanban_ui'))
WHERE name = 'Kanban';
```

### 6. Validation

Verify that the migrations were applied correctly and that the existing functionality works as expected:

```sql
-- Check that tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND 
      table_name IN ('feature_flags', 'user_modules', 'service_modules', 'module_dependencies');

-- Check that columns were added
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' AND 
      (
        (table_name = 'system_modules' AND column_name IN ('feature_flags_enabled', 'extended_metadata')) OR
        (table_name = 'user_profiles' AND column_name = 'feature_preferences') OR
        (table_name = 'leads' AND column_name = 'feature_metadata')
      );

-- Test RLS policies by querying as different users
-- You should see different results based on the user's role
```

Run integration tests to ensure existing functionality works with the new schema:

```bash
npm run test
```

### 7. Code Integration

1. Install the feature flags module
2. Update the application to use feature flags where appropriate
3. Update components to check for module access

### 8. Rollback Plan

If issues are encountered, you can roll back the migrations:

```bash
# Roll back the most recent migration
supabase migration down --db-url $SUPABASE_DB_URL -n 1

# Or restore from backup
cat backup_20250519.sql | supabase db restore --db-url $SUPABASE_DB_URL
```

## CI/CD Integration

Add these steps to your GitHub Actions workflow:

```yaml
name: Apply DB Migrations

on:
  push:
    branches:
      - main
    paths:
      - 'supabase/migrations/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        
      - name: Apply Migrations
        run: |
          supabase link --project-ref kkazhcihooovsuwravhs
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          
      - name: Regenerate Types
        run: |
          npx supabase gen types typescript --project-id kkazhcihooovsuwravhs > src/integrations/supabase/types.ts
          
      - name: Commit updated types
        uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: "chore: update Supabase types"
          file_pattern: src/integrations/supabase/types.ts
```

## Using Feature Flags in the Application

```typescript
import { useFeatureFlag } from '@/modules/feature_flags/hooks/useFeatureFlag';

const MyComponent = () => {
  const { isEnabled, isLoading } = useFeatureFlag('new_kanban_ui', false);
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {isEnabled ? (
        <div>New feature enabled!</div>
      ) : (
        <div>Using standard feature</div>
      )}
    </div>
  );
};
```

## Using Module Access in the Application

```typescript
import { useModuleAccess } from '@/modules/feature_flags/hooks/useModules';

const MyComponent = () => {
  const { hasAccess, isLoading } = useModuleAccess('analytics');
  
  if (isLoading) return <div>Loading...</div>;
  
  if (!hasAccess) {
    return <div>You don't have access to this module</div>;
  }
  
  return <div>Analytics module content</div>;
};
```

## Impact on Existing Code

These changes are non-destructive and should not affect existing functionality. They add new capabilities without modifying existing behavior.
