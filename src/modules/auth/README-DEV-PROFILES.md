
# Development User Profiles

This feature provides an easy way to switch between different user profiles during development without needing to log in or out. It is only available in development mode and is automatically removed from production builds.

## Usage

### Adding Dev Profiles

1. Create or edit your `.env.development` file in the project root.
2. Add user profiles using the `VITE_DEV_USER_` prefix followed by a unique key:

```env
VITE_DEV_USER_PRIVAT='{"id":"u1","name":"Ola Nordmann","role":"member","initials":"ON"}'
VITE_DEV_USER_BEDRIFT='{"id":"u2","name":"ACME AS","role":"business","initials":"AC"}'
VITE_DEV_USER_SUPER='{"id":"u3","name":"Super Admin","role":"master_admin","initials":"SA"}'
```

Each profile should be a valid JSON object with at least the following properties:
- `id`: Unique identifier for the user
- `name`: Display name
- `role`: User role (must be a valid `UserRole` from the auth module)
- `initials`: 1-3 character initials to display in the UI

Optional properties:
- `email`: User email address
- `company_id`: Company ID for company users
- `metadata`: Any additional metadata needed for testing

### Switching Profiles

There are several ways to switch between profiles:

1. **URL Parameter**: Add `?dev=KEY` to any URL in your app, e.g., `http://localhost:3000/?dev=super`
2. **UI Interface**: Click on the "DEV" button in the header to select a profile
3. **Programmatically**: Import and use the `switchDevUser` function:

```tsx
import { switchDevUser } from '@/modules/auth';

// Switch to the 'bedrift' profile
switchDevUser('bedrift');
```

The selected profile is stored in localStorage and persists between page refreshes.

## How It Works

1. During development, the `useDevAuth` hook loads profiles from environment variables.
2. When a profile is selected, it overrides the actual authentication state.
3. The UI is updated to show the currently selected profile.
4. In production builds, all dev profile code is tree-shaken and removed.

## Technical Notes

- All dev profile functionality is conditionally executed only when `import.meta.env.MODE === 'development'`.
- The implementation uses React context to propagate the selected profile through the app.
- Profiles are stored in localStorage under the key `devUser`.

## Testing

There are unit tests for the dev profile functionality in `src/modules/auth/__tests__/devProfiles.test.tsx`.
