# Profiles & Auth Consolidation

## Overview
Unified user profile and authentication system with role-based access control.

## Core Components
- `UserProfile`: Centralized user data with role-based permissions
- `CompanyProfile`: Company-specific data and settings
- `ProtectedRoute`: Role-based route protection
- `Authenticated`: Authentication wrapper with role checking

## Standardized Roles
- `guest`: Unauthenticated users
- `user`: Standard authenticated users
- `company`: Business accounts
- `content_editor`: Content management role
- `admin`: Administrative access
- `master_admin`: Full system access

## Key Features
- Role-based navigation configuration
- Centralized permission checking
- Norwegian UI translations with English backend
- Session persistence and auto-refresh
- Profile customization with preferences

## Security
- Row Level Security (RLS) policies for all user data
- Role-based access control throughout application
- Secure authentication flow with Supabase
- Proper session management

## Files
- Auth utilities: `src/modules/auth/`
- Profile components: `src/modules/profiles/`
- Navigation: `src/lib/navigation/`
- Types: `src/modules/auth/utils/roles/`