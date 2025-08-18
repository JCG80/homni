feat(roles): fast role switching via RoleContext + secure session mode + RLS helper

# 🚀 Feature: Fast Role Switching with RoleContext

## Summary
Implements layered authentication system with personal/professional mode switching while preserving existing canonical role system.

## 🔧 Technical Changes

**Frontend Integration:**
- ✅ Added `@supabase/auth-helpers-react` dependency
- ✅ Created `src/contexts/RoleContext.tsx` for mode switching
- ✅ Built `useIntegratedAuth` hook bridging existing auth + mode contexts
- ✅ Updated `App.tsx` with `SessionContextProvider` + `RoleProvider` hierarchy
- ✅ Refactored `RoleModeSwitcher` to use new context with button-based UI

**Backend Infrastructure:**
- ✅ Created `switch-role` edge function with CORS, validation, and audit logging
- ✅ Added `get_active_mode()` SQL helper for reading JWT app_metadata
- ✅ Created `role_switch_audit` table with RLS policies and indexes

**UI Components:**
- ✅ `ModeSwitcher` component with personal/professional toggle
- ✅ Mode-aware access control via `canSwitchToProfessional`
- ✅ Error handling and loading states for mode transitions

## 🧪 Testing & Quality

**E2E Tests:**
- ✅ `tests/e2e/admin_menu_visibility.spec.ts` - Verifies admin menus hidden in user mode
- ✅ `tests/e2e/role_switch.spec.ts` - Tests professional mode switching

**Security:**
- ✅ RLS policies on audit table (users see own, admins see all)
- ✅ Server-side mode validation in edge function
- ✅ CORS headers and OPTIONS handling

## 🔄 Migration Details

```sql
-- Added get_active_mode() function for RLS policies
-- Created role_switch_audit table with proper RLS
-- Indexes for performance on user_id and created_at
```

## 🎯 User Experience

**Mode Switching:**
- Personal mode: `user` role access pattern
- Professional mode: `company` role access pattern  
- Seamless UI updates without page refresh
- Audit trail for compliance

**Backward Compatibility:**
- ✅ All existing auth functionality preserved
- ✅ Canonical roles (admin/master_admin) work across both modes
- ✅ Legacy components continue working via bridge hook

## 📋 Testing Checklist

- [ ] Switch from personal to professional mode
- [ ] Verify UI updates reflect new mode
- [ ] Check audit entries are created
- [ ] Confirm admin/master_admin roles preserved
- [ ] Test error handling for invalid mode switches
- [ ] Verify E2E tests pass

## 🔗 Related Documentation

- Updated `docs/roles-and-permissions.md` with mode switching section
- Added `.env.local.example` for local edge function development

## 🚨 Deployment Notes

- Edge function deploys automatically
- Migration creates new table and function
- No breaking changes to existing authentication flow