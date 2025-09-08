# Find-Before-Build Architecture Guide

This document outlines the systematic approach to prevent duplicate components, objects, and database entities in the Homni platform.

## Core Principle

**ALWAYS SEARCH FIRST** - Before creating any new component, object, or database entity, perform a comprehensive search to ensure it doesn't already exist.

## Search Strategy

### 1. Code Search
```bash
# Search for similar components
npm run find-duplicates

# Search for specific patterns
grep -r "ComponentName" src/
```

### 2. Database Search
```sql
-- Check for similar tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%pattern%';

-- Check for similar columns
SELECT table_name, column_name FROM information_schema.columns 
WHERE column_name LIKE '%pattern%';
```

### 3. Type Search
```bash
# Search TypeScript interfaces
grep -r "interface.*Name" src/
grep -r "type.*Name" src/
```

## Decision Matrix

| Found | Action | Rationale |
|-------|--------|-----------|
| Exact match | Use existing | Prevent duplication |
| Similar functionality | Extend existing | Maintain consistency |
| Placeholder/stub | Replace with functional | Improve code quality |
| Nothing found | Create new | Fill genuine gap |

## Implementation Steps

### For Components
1. **Search**: Check `src/components/`, `src/modules/`, `src/pages/`
2. **Analyze**: Compare functionality, completeness, usage
3. **Decision**: Keep most robust version
4. **Clean**: Remove duplicates, update imports
5. **Test**: Verify all references work

### For Database Objects
1. **Search**: Check migrations, types, existing tables
2. **Analyze**: Compare schema, constraints, relationships  
3. **Decision**: Extend existing or create new
4. **Migrate**: Use proper migration with rollback
5. **Verify**: Test RLS policies and data integrity

### For Types/Interfaces
1. **Search**: Check all `.ts` files for similar types
2. **Analyze**: Compare properties, usage patterns
3. **Decision**: Consolidate to single source of truth
4. **Refactor**: Update all imports and references
5. **Validate**: Ensure type safety maintained

## Quality Gates

### Pre-commit Checks
- No duplicate components (automated scan)
- No unused types/interfaces
- No orphaned migrations
- All imports resolve correctly

### CI/CD Validation
- Build passes without errors
- Type checking passes
- No duplicate database objects
- All tests pass

## Tools and Scripts

### Duplicate Detection
```bash
# Run duplicate page scanner
npm run find-duplicates

# Check for unused exports
npm run find-unused

# Validate database consistency
npm run validate-db
```

### Automated Cleanup
```bash
# Remove duplicate imports
npm run clean-imports

# Consolidate types
npm run consolidate-types

# Update migration dependencies
npm run check-migrations
```

## Common Patterns

### Admin Pages Structure
- Functional: `src/modules/admin/pages/`
- Routes: Reference functional versions only
- Tests: Co-located with functional components

### Database Entities
- Types: Single canonical source in `src/types/`
- Migrations: Forward + rollback pairs
- RLS: Consistent auth patterns

### Type Definitions
- Canonical: `src/types/domain-canonical.ts`
- Domain-specific: Extend canonical types
- Avoid: Multiple similar interfaces

## Rollback Strategy

Every change must include rollback capability:

1. **Code**: Git revert + dependency cleanup
2. **Database**: Migration rollback scripts
3. **Types**: Revert + re-run type generation
4. **Routes**: Restore previous working state

## Monitoring & Alerts

### Warning Signs
- Build errors from missing imports
- Type conflicts between modules  
- Multiple similar database tables
- Unused exports accumulating

### Response Actions
1. Stop new development
2. Identify root cause
3. Apply find-before-build analysis
4. Clean up systematically
5. Update prevention tools

## Success Metrics

- ✅ Zero duplicate components detected
- ✅ All builds pass without warnings
- ✅ Database schema is normalized
- ✅ Type system is consistent
- ✅ CI/CD pipeline is green
- ✅ No orphaned code or migrations

This approach ensures the Homni platform remains maintainable, scalable, and free of technical debt from duplication.