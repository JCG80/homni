
# Changelog

## [Unreleased]

### Changed
- **PHASE 1-6 CLEANUP COMPLETE**: Standardized status/pipeline system repo-wide
- Database migration: converted enum values from emojis to slugs ('new', 'in_progress', 'won', 'lost', etc.)
- TypeScript standardization: all types now use slug-based values consistently
- UI layer: proper emoji/label mapping separated from business logic
- Removed duplicate navigation config and consolidated imports
- Created comprehensive documentation for standardization process
- Standardized user roles across the application to: 'guest', 'user', 'company', 'content_editor', 'admin', 'master_admin'
- Updated all role-related utilities to use the new canonical roles
- Changed 'anonymous' references to 'guest' and 'member' references to 'user'
- Updated Authenticated component to use `user?.role ?? 'guest'`
- Updated ProtectedRoute component to handle new role system
- Translated user-facing messages to Norwegian for consistency
- Maintained English variable names and comments in backend code
- Consolidated role verification in auth utilities
- Fixed build errors related to UserRole type mismatches

### Fixed
- Corrected role access checks in ProtectedRoute and Authenticated components
- Updated routes configuration to use new role names
- Fixed BreadcrumbNav to display correct Norwegian labels
- Fixed type errors in role references

### Removed
- Removed unused role types and references to deprecated roles
