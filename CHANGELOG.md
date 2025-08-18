### Changed
- Standardized app roles to: `guest`, `user`, `company`, `content_editor`, `admin`, `master_admin`
- Updated all role-related utilities to use the canonical roles above
- Changed legacy references: `anonymous` → `guest`, `member` → `user`
- Updated `Authenticated` default to `user?.role ?? 'guest'`
- Updated `ProtectedRoute` and route configs to use canonical role names
- Translated user-facing messages to Norwegian while keeping English code identifiers
- Consolidated role verification in auth utilities
- Fixed build/type errors from role mismatches

### Fixed
- Corrected role access checks in `ProtectedRoute` and `Authenticated`
- Updated navigation (`navConfig`) and route mapping to canonical roles
- Fixed Breadcrumb/labels to correct Norwegian strings
- Resolved type errors in role references

### Removed
- Removed legacy/non-canonical roles and references: `anonymous`, `member`, `provider`, `editor`
