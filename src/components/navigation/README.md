
# Navigation System

This directory contains the role-based navigation system for the application.

## Overview

The navigation system is built around the concept of role-based access control, where different user roles see different navigation options. The system consists of:

1. `RoleBasedNavigation.tsx`: A component that renders navigation items based on the user's role.
2. `/src/config/navigation.tsx`: Configuration for navigation items per role.

## Role-Based Navigation

The navigation configuration in `navigation.tsx` defines navigation items for each user role:

- `member`: Regular users with property-focused navigation
- `company`: Business users with lead and analytics focused navigation
- `content_editor`: Users who manage content
- `admin`: Administrator users with company and member management
- `master_admin`: Super administrators with full system access
- `guest`: Unauthenticated users

## Usage

```tsx
import { RoleBasedNavigation } from '@/components/navigation/RoleBasedNavigation';

// Vertical navigation (sidebar)
<RoleBasedNavigation variant="vertical" />

// Horizontal navigation (top bar)
<RoleBasedNavigation variant="horizontal" />
```

## Extending

To add new navigation items:

1. Update the `navConfig` object in `/src/config/navigation.tsx`
2. Add the corresponding route in your routing configuration

## Best Practices

- Keep navigation items organized by role
- Use descriptive titles and icons
- Group related items together
- Consider using children for sub-navigation
- Minimize the number of top-level items (5-7 is ideal)
