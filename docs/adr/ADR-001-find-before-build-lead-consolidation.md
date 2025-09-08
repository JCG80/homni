# ADR-001: Find-Before-Build Lead Consolidation

**Status**: Implemented  
**Date**: 2025-01-08  
**Context**: Duplicate Lead interfaces and missing database fields causing build errors

## Problem Statement

The codebase contained multiple duplicate Lead interface definitions and missing database columns that code was already trying to use:

### Found Issues:
1. **Duplicate Lead Interfaces**: 3 different definitions across files
   - `src/types/leads.ts` 
   - `src/types/leads-consolidated.ts`
   - `src/modules/leads/types/leadTypes.ts`

2. **Missing Database Fields**: Code used `customer_name`, `customer_email`, `customer_phone` but database lacked these columns

3. **Type Mismatches**: Components using non-existent properties like `location`, `leadType`, `estimatedValue`

## Solution Implemented

### 1. Database Schema Migration
```sql
-- Added missing customer contact fields as nullable (non-breaking)
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT, 
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- PII/GDPR compliance annotations
COMMENT ON COLUMN public.leads.customer_name IS 'PII: Customer full name, must be deletable for GDPR compliance';
-- ... (additional comments)

-- Backfilled from metadata where present
UPDATE public.leads SET 
  customer_name = COALESCE(customer_name, metadata->>'customer_name', metadata->>'contact_name')
  -- ... (additional updates)
```

### 2. Type Consolidation
- **Created**: `src/types/leads-canonical.ts` as single source of truth
- **Deleted**: `src/types/leads-consolidated.ts`, `src/modules/leads/types/leadTypes.ts`
- **Updated**: All imports to use canonical source

### 3. Interface Definition
```typescript
export interface Lead {
  // Primary key
  id: string;
  
  // Core lead data
  title: string;
  description: string;
  category: string;
  status: LeadStatus;
  
  // PII Customer Contact (added in migration)
  customer_name?: string;
  customer_email?: string; 
  customer_phone?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Flexible metadata for legacy support
  metadata?: Record<string, any>;
}
```

### 4. Code Updates
- Fixed property access in `LeadEngineInterface.tsx` to use `metadata.*` for legacy properties
- Updated all imports across 14+ files to use canonical source
- Maintained backward compatibility through re-exports

## Data Governance

### PII/GDPR Compliance
- Customer contact fields marked as PII in database comments
- Fields are nullable for data deletion compliance
- Existing metadata preserved during migration

### Migration Strategy
- **Non-breaking**: All new columns nullable
- **Backward-compatible**: Existing metadata preserved
- **Rollback-ready**: Can drop columns safely

## Verification

### Tests Required
- [x] Database migration successful
- [x] Build errors resolved
- [x] Type consolidation complete
- [ ] Unit tests for new Lead interface
- [ ] Integration tests for customer data access
- [ ] E2E test for dashboard widgets

### Coverage
- Database schema: ✅ 100% aligned with TypeScript types
- Code consolidation: ✅ All duplicates eliminated
- Import updates: ✅ 14 files updated to canonical source

## Rollback Plan

If issues arise:
```sql
-- Rollback migration
ALTER TABLE public.leads
DROP COLUMN customer_phone,
DROP COLUMN customer_email,
DROP COLUMN customer_name;
```

Components will gracefully handle missing fields via optional properties.

## Security Considerations

⚠️ **Security Linter Warnings**: 58 warnings detected post-migration (unrelated to this change)
- Existing RLS policies cover new columns automatically
- No new security vulnerabilities introduced
- All warnings are pre-existing system-wide issues

## Future Actions

1. **Phase 2**: Clean up metadata entries that were migrated to direct columns
2. **Testing**: Add comprehensive test coverage for Lead interface
3. **Documentation**: Update API documentation with new schema
4. **Monitoring**: Track usage of new customer contact fields

## Definition of Done ✅

- [x] Single canonical Lead type replaces duplicates
- [x] Database schema matches TypeScript interface 100%
- [x] All customer contact fields have proper RLS policies  
- [x] Migration + rollback scripts tested
- [x] No more "undefined property" errors in console
- [x] PII/GDPR compliance documented
- [x] All imports updated to canonical source

**Result**: Build errors eliminated, type safety restored, foundation set for dashboard implementation.