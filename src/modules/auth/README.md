
# Auth Module

This module handles all authentication and user management functions.

## Components

- **AuthForm**: Base form for authentication flows
- **LoginForm**: Email/password login form
- **RegisterForm**: New user registration form
- **OAuthButtons**: Third-party authentication buttons (if configured)
- **ProtectedRoute**: Route wrapper to control access based on auth status and user roles

## Pages

- **LoginPage**: Main login screen
- **RegisterPage**: User registration screen
- **ForgotPasswordPage**: Password reset initiation
- **ResetPasswordConfirmationPage**: Password reset confirmation
- **AuthManagementPage**: Admin page for user role management
- **ProfilePage**: User profile management
- **CompanyProfilePage**: Company profile management

## Hooks

- **useAuth**: Main auth hook providing user state, role checking, etc.
- **useRoleGuard**: Hook for access control based on user role

## Utils

- **authProviders**: Configuration for authentication providers
- **getAllowedModulesForRole**: Maps user roles to allowed modules
- **roles**: Central definition of user roles

## Roles

The system supports the following user roles:

- `anonymous`: Unauthenticated user or user with minimal privileges
- `user`: Standard authenticated user
- `member`: Member with standard privileges
- `company`: Company account with lead access
- `admin`: Administrator with system management privileges
- `master-admin`: Super administrator with full system control

## Error Handling

Authentication operations include:
- Automatic retries for network failures
- Friendly error messages for common auth issues (wrong password, etc.)
- Validation to prevent invalid form submissions
- Clear feedback during auth processes (loading states, etc.)

## Role-based Access Control

Access to routes and features is controlled by:
- The `ProtectedRoute` component for route-level access
- The `useRoleGuard` hook for component-level access
- Row Level Security policies in the database

## User Profile Integration

- When a user signs up, a profile is automatically created in the `user_profiles` table via a Supabase trigger
- The user profile ID matches the auth.users ID
- The UI checks both user authentication and profile existence
- If a profile is missing, the `Authenticated` component shows an error screen with options to:
  - Create a new profile
  - Log in again
  - Contact administrator

## Company Profile Integration

- When a business user signs up, both a user profile and a company profile are created
- The company profile is linked to the user profile via the `company_id` field
- Business users can access company-specific features based on their role and company association
- If a company profile is missing for a company user, a fallback UI is shown with options to:
  - Register a new company
  - Contact administrator
  - Refresh profile data

## Testing

Auth functionality is tested via:
- Unit tests for components and hooks
- Integration tests for auth flows
- Role-based access tests
