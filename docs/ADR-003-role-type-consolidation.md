# ADR-003: Role Type System Consolidation

## Status
✅ **COMPLETED** - 2025-09-08

## Context
Multiple `UserRole` type definitions and `ALL_ROLES` constants existed across the codebase, causing:
- Inconsistent role ordering in UI dropdowns
- Import confusion between different role sources
- Maintenance overhead with multiple sources of truth
- TypeScript build errors due to conflicting definitions
- Build failures from deprecated dependencies (node-sass, you package)

## Decision
Establish `src/modules/auth/normalizeRole.ts` as the **single source of truth** for all role-related types and constants.

## Implementation

### 1. Canonical Source Established
**File: `src/modules/auth/normalizeRole.ts`**
```typescript
export type UserRole = 'guest' | 'user' | 'company' | 'content_editor' | 'admin' | 'master_admin';

export const ALL_ROLES: UserRole[] = [
  'guest', 'user', 'company', 'content_editor', 'admin', 'master_admin'
];
```

### 2. Duplicate Elimination
**Removed duplicate definitions from:**
- `src/modules/auth/utils/roles/types.ts` → Now re-exports from canonical source
- `src/types/auth.ts` → Now imports from canonical source  
- `src/routes/routeTypes.ts` → Removed duplicate UserRole type

### 3. Shared UI Constants
**Created: `src/modules/auth/utils/shared/roleDisplay.ts`**
- Consolidated `roleIcons` and `roleLabels` mappings
- Single source for role display consistency
- Removed duplicates from individual components

### 4. Import Standardization
**All role-related imports now use:**
```typescript
import { UserRole, ALL_ROLES } from '@/modules/auth/normalizeRole';
import { roleIcons, roleLabels } from '@/modules/auth/utils/shared/roleDisplay';
```

### 5. Backward Compatibility
Legacy files maintained as re-export wrappers with deprecation notices:
```typescript
// DEPRECATED: Use @/modules/auth/normalizeRole instead
import { UserRole, ALL_ROLES } from '@/modules/auth/normalizeRole';
export type { UserRole };
export { ALL_ROLES };
```

## Enhanced Duplicate Detection

### Script: `scripts/find-duplicate-pages.ts`
Extended to detect:
- Duplicate page components
- Duplicate type definitions (UserRole, ALL_ROLES, etc.)
- Duplicate constants (roleIcons, roleLabels)
- Severity levels (error vs warning)

### CI Integration
```json
{
  "scripts": {
    "find-duplicates": "ts-node scripts/find-duplicate-pages.ts",
    "pre-commit": "npm run find-duplicates && npm run lint"
  }
}
```

## File Changes

### Modified Files:
1. `src/modules/auth/normalizeRole.ts` - Added ALL_ROLES constant
2. `src/modules/auth/utils/roles/types.ts` - Now re-exports from canonical source
3. `src/types/auth.ts` - Imports from canonical source, marked deprecated
4. `src/routes/routeTypes.ts` - Re-exports UserRole for compatibility
5. `src/modules/admin/components/RoleManagement.tsx` - Uses shared role display constants
6. `src/hooks/useCurrentRole.ts` - Updated import path

### Created Files:
1. `src/modules/auth/utils/shared/roleDisplay.ts` - Shared role UI constants
2. `docs/ADR-003-role-type-consolidation.md` - This decision record

### Updated Files:
1. `scripts/find-duplicate-pages.ts` - Enhanced duplicate detection
2. `docs/FIND_BEFORE_BUILD.md` - Updated with type consolidation examples

## Benefits

### Immediate:
- ✅ Zero TypeScript build errors
- ✅ Consistent role ordering in all UI components  
- ✅ Single import path for all role-related functionality
- ✅ Reduced maintenance overhead

### Long-term:
- 🚀 Prevents future role-related duplications via CI checks
- 🚀 Clear pattern for other type consolidations
- 🚀 Simplified onboarding (one canonical source to learn)
- 🚀 Easier refactoring and role system evolution

## Rollback Plan
1. **Git revert** all changes in this ADR
2. **Restore** previous duplicate definitions
3. **Run** `npm run typecheck` to verify build
4. **Update** imports back to legacy paths

## Lessons Learned
1. **Find-before-build** principle prevents accumulation of duplicates
2. **Canonical source** pattern should be applied to other type systems
3. **Enhanced scripts** catch duplicates before they cause issues
4. **Backward compatibility** wrappers ease migration pain

## Next Steps
1. Apply same consolidation pattern to other duplicated types
2. Extend CI checks to prevent future role-related duplications
3. Consider consolidating other auth-related types using same pattern
4. Monitor for any missed imports during feature development

---
**Author:** AI Assistant  
**Date:** 2025-09-08  
**Reviewers:** [To be filled by team]  
**Status:** Implemented & Tested ✅