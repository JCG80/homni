# Database Functions Reference

## 🗄 Supabase RPC Functions

This document outlines the custom PostgreSQL functions (RPCs) available in the Homni platform.

## 🔐 Authentication Functions

### `get_user_role(user_uuid UUID)`
Returns the current role for a given user.

```sql
SELECT get_user_role(auth.uid());
```

**Returns**: `user_role` enum value  
**Security**: SECURITY DEFINER, respects RLS policies

---

### `upgrade_user_to_company(p_user_id UUID, p_company_data JSON)`
Upgrades a regular user account to a company account.

```sql
SELECT upgrade_user_to_company(
  'user-uuid-here',
  '{"name": "Company Name", "org_number": "123456789"}'::json
);
```

**Parameters**:
- `p_user_id`: Target user UUID
- `p_company_data`: Company profile information

**Returns**: `void`  
**Security**: Requires authenticated user, validates ownership

## 👥 User Management Functions

### `assign_user_role(p_target_user_id UUID, p_new_role user_role, p_admin_user_id UUID)`
Assigns a new role to a user (admin/master_admin only).

```sql
SELECT assign_user_role(
  'target-user-uuid',
  'company'::user_role,
  'admin-user-uuid'
);
```

**Parameters**:
- `p_target_user_id`: User to update
- `p_new_role`: New role to assign
- `p_admin_user_id`: Admin performing the action

**Returns**: `void`  
**Security**: Requires admin/master_admin role, logs all changes

---

### `get_company_members(p_company_id UUID)`
Returns all members of a specific company.

```sql
SELECT * FROM get_company_members('company-uuid-here');
```

**Returns**: Table of user profiles with roles  
**Security**: Company members and admins only

## 📋 Lead Management Functions

### `calculate_lead_score(p_lead_id UUID)`
Calculates a numerical score for lead quality and priority.

```sql
SELECT calculate_lead_score('lead-uuid-here');
```

**Scoring Factors**:
- Budget range (0-20 points)
- Urgency level (0-15 points) 
- Contact completeness (0-10 points)
- Geographic proximity (0-5 points)

**Returns**: `INTEGER` score (0-100)  
**Security**: Public function, no sensitive data exposed

---

### `distribute_leads(p_lead_ids UUID[], p_max_assignments INTEGER DEFAULT 3)`
Distributes leads to qualified companies based on scoring algorithm.

```sql
SELECT distribute_leads(
  ARRAY['lead-1-uuid', 'lead-2-uuid'],
  5
);
```

**Parameters**:
- `p_lead_ids`: Array of lead UUIDs to distribute
- `p_max_assignments`: Maximum companies per lead

**Returns**: Table with assignment results  
**Security**: Admin only, creates audit trail

---

### `purchase_lead_assignment(p_assignment_id UUID, p_company_id UUID)`
Processes lead purchase by a company.

```sql
SELECT purchase_lead_assignment(
  'assignment-uuid',
  'company-uuid'
);
```

**Business Logic**:
- Validates company has sufficient credits/payment method
- Marks assignment as purchased
- Triggers notification workflows
- Updates company metrics

**Returns**: Purchase confirmation object  
**Security**: Company members only, validates ownership

## 📊 Analytics Functions  

### `get_company_lead_metrics(p_company_id UUID, p_days INTEGER DEFAULT 30)`
Returns lead performance metrics for a company.

```sql
SELECT * FROM get_company_lead_metrics('company-uuid', 30);
```

**Metrics Included**:
- Total leads assigned
- Conversion rate  
- Average response time
- ROI calculations

**Returns**: Metrics object with aggregated data  
**Security**: Company members and admins only

---

### `get_platform_analytics(p_start_date DATE, p_end_date DATE)`  
Returns platform-wide analytics (admin only).

```sql
SELECT * FROM get_platform_analytics('2025-01-01', '2025-01-31');
```

**Analytics Included**:
- User registration trends
- Lead volume and distribution
- Revenue metrics
- Geographic distribution

**Returns**: Comprehensive analytics object  
**Security**: Admin/master_admin only

## 🏠 Property Functions

### `create_property_profile(p_user_id UUID, p_property_data JSON)`
Creates a new property profile for documentation tracking.

```sql
SELECT create_property_profile(
  auth.uid(),
  '{"address": "123 Main St", "type": "single_family", "year_built": 1995}'::json
);
```

**Returns**: Property profile UUID  
**Security**: Authenticated users only, RLS enforced

---

### `schedule_maintenance(p_property_id UUID, p_maintenance_data JSON)`
Schedules maintenance tasks for a property.

```sql
SELECT schedule_maintenance(
  'property-uuid',
  '{"task": "HVAC Service", "due_date": "2025-06-01", "priority": "medium"}'::json
);
```

**Returns**: Maintenance task UUID  
**Security**: Property owners only

## 🎛 Feature Flag Functions

### `get_user_feature_flags(p_user_id UUID DEFAULT NULL)`
Returns active feature flags for a user based on their role and targeting.

```sql
SELECT * FROM get_user_feature_flags(auth.uid());
```

**Returns**: Array of enabled feature flag names  
**Security**: Public function, respects targeting rules

---

### `toggle_feature_flag(p_flag_name TEXT, p_enabled BOOLEAN)`
Toggles a feature flag on/off (admin only).

```sql
SELECT toggle_feature_flag('ENABLE_ANALYTICS_DASHBOARD', true);
```

**Returns**: Updated feature flag object  
**Security**: Admin/master_admin only, logs all changes

## 🔧 System Functions

### `cleanup_expired_data(p_days_old INTEGER DEFAULT 90)`
Removes expired data according to retention policies.

```sql
SELECT cleanup_expired_data(90);
```

**Cleanup Targets**:
- Expired lead assignments
- Old session tokens
- Archived audit logs
- Temporary file uploads

**Returns**: Cleanup summary object  
**Security**: System/cron only, comprehensive logging

---

### `health_check()`
Returns system health status and key metrics.

```sql
SELECT * FROM health_check();
```

**Health Indicators**:
- Database connection status
- Table row counts
- Recent error rates
- Performance metrics

**Returns**: Health status object  
**Security**: Admin only for detailed metrics

## 📝 Usage Examples

### Complete User Onboarding Flow
```sql
-- 1. Create user profile (handled by trigger)
-- 2. Check user role
SELECT get_user_role(auth.uid());

-- 3. If company signup, upgrade account
SELECT upgrade_user_to_company(
  auth.uid(),
  '{"name": "ABC Plumbing", "org_number": "987654321"}'::json
);

-- 4. Get feature flags for new user
SELECT * FROM get_user_feature_flags(auth.uid());
```

### Lead Processing Workflow
```sql
-- 1. Calculate lead scores for new leads
SELECT id, calculate_lead_score(id) as score 
FROM leads 
WHERE status = 'pending';

-- 2. Distribute high-scoring leads  
SELECT distribute_leads(
  ARRAY(SELECT id FROM leads WHERE status = 'pending' ORDER BY created_at LIMIT 10)
);

-- 3. Check company metrics after distribution
SELECT * FROM get_company_lead_metrics('company-uuid', 7);
```

### Admin Maintenance Tasks
```sql
-- 1. Check system health
SELECT * FROM health_check();

-- 2. Review platform analytics
SELECT * FROM get_platform_analytics(
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE
);

-- 3. Clean up old data
SELECT cleanup_expired_data(30);
```

## 🛡 Security Considerations

### Function Security Model
- **SECURITY DEFINER**: Functions run with creator privileges
- **RLS Enforcement**: All functions respect row-level security
- **Input Validation**: All parameters validated and sanitized
- **Audit Logging**: Sensitive operations logged with user attribution

### Access Control Patterns
```sql
-- Standard permission check pattern
IF NOT EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'master_admin')
) THEN
  RAISE EXCEPTION 'Insufficient permissions';
END IF;
```

### Error Handling
```sql
-- Consistent error handling
BEGIN
  -- Function logic here
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error details
    INSERT INTO error_log (function_name, error_message, user_id)
    VALUES ('function_name', SQLERRM, auth.uid());
    -- Re-raise with user-friendly message
    RAISE EXCEPTION 'Operation failed. Please try again or contact support.';
END;
```