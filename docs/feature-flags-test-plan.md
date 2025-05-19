
# Feature Flags and Module Access Test Plan

## Overview
This document outlines the testing strategy for the feature flags and module access functionality, including the RPC functions and TypeScript hooks.

## Unit Tests

### Feature Flag Tests
1. Test `useFeatureFlag` hook:
   - Feature flag exists and is enabled for user
   - Feature flag exists but is disabled
   - Feature flag doesn't exist (fallback to default)
   - User doesn't have a role that matches target roles
   - User has role that matches target roles
   - Percentage rollout functionality (with deterministic results)

2. Test `useFeatureFlags` hook:
   - Fetching all feature flags
   - Handling empty results
   - Error handling

### Module Access Tests
1. Test `useUserModules` hook:
   - User has access to modules
   - User has no modules
   - Error handling

2. Test `useModuleAccess` hook:
   - User has access to specific module
   - User doesn't have access
   - Module doesn't exist
   - Error handling

## Manual Testing

### RPC Functions
1. Test `is_feature_enabled`:
   ```sql
   SELECT is_feature_enabled('test_flag', '00000000-0000-0000-0000-000000000001');
   ```

2. Test `get_user_enabled_modules`:
   ```sql
   SELECT * FROM get_user_enabled_modules('00000000-0000-0000-0000-000000000001');
   ```

3. Test `has_module_access`:
   ```sql
   SELECT has_module_access('test_module', '00000000-0000-0000-0000-000000000001');
   ```

### UI Integration Testing
1. Create test feature flags in the database:
   ```sql
   INSERT INTO public.feature_flags (name, description, is_enabled, percentage_rollout)
   VALUES ('test_feature', 'Test feature flag', true, 100);
   ```

2. Create test modules and user access:
   ```sql
   INSERT INTO public.system_modules (name, description, is_active)
   VALUES ('test_module', 'Test module', true);
   
   INSERT INTO public.user_modules (user_id, module_id, is_enabled)
   VALUES ('user_id_here', 'module_id_here', true);
   ```

3. Test feature flag UI component:
   - Verify that components wrapped with feature flag providers display correctly when the flag is enabled
   - Verify that components are hidden when the flag is disabled

4. Test module access:
   - Verify that users can access modules they have access to
   - Verify that users are denied access to modules they don't have access to

## Regression Testing
- Verify that existing functionality continues to work as expected
- Check that no unintended side effects occur in other parts of the application

## Performance Testing
- Measure the additional latency introduced by feature flag checks
- Test with a large number of feature flags and module access rules
