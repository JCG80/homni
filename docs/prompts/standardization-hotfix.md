# Standardization Hotfix (Repo-wide Status/Pipeline Cleanup)

## Problem
- Mixed emoji/slug status values causing TypeScript errors
- Database uses emojis, code expects slugs
- Inconsistent status handling across components

## Solution
1. **Database Migration**: Convert enum values to slugs
2. **Type Standardization**: Use slug-based types everywhere
3. **UI Mapping**: Map slugs to emojis/labels in display layer only
4. **Legacy Support**: Handle emoji inputs via normalization

## Key Changes
- `pipeline_stage` enum: emojis → slugs ('new', 'in_progress', 'won', 'lost')
- `lead_status` enum: emojis → slugs ('new', 'contacted', 'qualified', 'converted', 'lost')
- All TypeScript types use slug values
- UI components map slugs to display values

## Files Modified
- Database: migrations for enum cleanup
- Types: `src/types/leads.ts` standardized to slugs
- Components: Updated to use `STATUS_LABELS` instead of `STATUS_EMOJI`
- API: Normalized status handling in lead operations

## Verification
- TypeScript compilation clean
- Database functions use slug values
- UI displays correct emojis/labels
- Status transitions work correctly