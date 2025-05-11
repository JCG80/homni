
# Changelog

## [Unreleased]

### Changed
- Standardized user roles across the application to: 'anonymous', 'user', 'company', 'admin', 'master_admin'
- Updated all role-related utilities to use the new standardized roles
- Removed deprecated roles: 'provider', 'editor', 'member', 'guest'
- Changed 'guest' references to 'anonymous' and 'member' references to 'user'
- Updated Authenticated component to use `user?.role ?? 'anonymous'`
- Updated ProtectedRoute component to handle new role system
- Translated user-facing messages to Norwegian for consistency
- Maintained English variable names and comments in backend code
- Consolidated role verification in auth utilities

### Fixed
- Corrected role access checks in ProtectedRoute and Authenticated components
- Updated routes configuration to use new role names
- Fixed BreadcrumbNav to display correct Norwegian labels

### Removed
- Removed unused role types and references to deprecated roles

