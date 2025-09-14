
# Feature Flags and Module Management

This module provides functionality for feature flags and module management in the application.

## Database Schema

Four new tables have been added to support feature flags and module management:

1. `user_modules`: User-specific module settings and enablement status
2. `service_modules`: Service-specific module configurations
3. `module_dependencies`: Dependencies between system modules
4. `feature_flags`: Feature flags for controlling feature availability

Additionally, existing tables have been extended:

1. `system_modules`: Added `feature_flags_enabled` and `extended_metadata` columns
2. `user_profiles`: Added `feature_preferences` column
3. `leads`: Added `feature_metadata` column

## Regenerating Supabase Types

To regenerate the Supabase types after applying these migrations, run:

```bash
npx supabase gen types typescript --project-id ${SUPABASE_PROJECT_ID} > src/integrations/supabase/types.ts
```

## Migration Roadmap

1. **Backup**: Take a database backup before applying migrations
   ```bash
   supabase db dump --db-url <SUPABASE_DB_URL> > backup_before_feature_flags.sql
   ```

2. **Deploy Migrations**: Apply the migrations in this sequence
   ```bash
   supabase migration up --db-url <SUPABASE_DB_URL>
   ```

3. **Data Population**: Insert initial data for feature flags and modules
   ```sql
   INSERT INTO feature_flags (name, description, is_enabled) 
   VALUES ('new_kanban_ui', 'New Kanban UI Experience', false);
   ```

4. **Verification**: Ensure existing functionality works
   ```bash
   # Run tests
   npm run test
   
   # Check integration tests
   npm run test:e2e
   ```

5. **Rollback Plan**: If needed, you can roll back
   ```bash
   # Roll back to a specific migration
   supabase migration down --db-url <SUPABASE_DB_URL> -n 1
   
   # Or restore from backup
   cat backup_before_feature_flags.sql | supabase db restore --db-url <SUPABASE_DB_URL>
   ```

## CI/CD Integration

Add these steps to your GitHub Actions workflow:

```yaml
- name: Apply Migrations
  run: npx supabase migration up
  env:
    SUPABASE_DB_URL: ${{ secrets.SUPABASE_DB_URL }}

- name: Regenerate Types
  run: npx supabase gen types typescript --project-id ${SUPABASE_PROJECT_ID} > src/integrations/supabase/types.ts

- name: Run Tests
  run: npm run test
```

## Feature Flag Usage Example

```typescript
import { useFeatureFlag } from '@/modules/feature_flags/hooks/useFeatureFlag';

const MyComponent = () => {
  const { isEnabled } = useFeatureFlag('new_kanban_ui', false);
  
  return (
    <div>
      {isEnabled ? (
        <NewKanbanBoard />
      ) : (
        <LegacyKanbanBoard />
      )}
    </div>
  );
};
```

## Module Access Usage Example

```typescript
import { useModuleAccess } from '@/modules/feature_flags/hooks/useModules';

const MyComponent = () => {
  const { hasAccess, isLoading } = useModuleAccess('analytics');
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {hasAccess ? (
        <AnalyticsModule />
      ) : (
        <AccessDenied />
      )}
    </div>
  );
};
```
