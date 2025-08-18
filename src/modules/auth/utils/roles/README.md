# User Role System Documentation

## Valid User Roles

The application uses a strict role-based access control system with the following roles:

### Core Roles
- **`guest`**: Not logged in users with limited access to public content
- **`user`**: Regular authenticated users (previously known as "member")
- **`company`**: Business/company users with access to company-specific features
- **`content_editor`**: Users who can create and edit content
- **`admin`**: Administrative users with elevated permissions
- **`master_admin`**: Highest level administrators with full system access

## Role Migration History

### Legacy Role Mappings
- `member` → `user` (deprecated, use `user` instead)
- `anonymous` → `guest` (deprecated, use `guest` instead)

## Role Validation

All roles are validated through:
- Database constraints (see `app_role` enum type)
- TypeScript type checking (`UserRole` type)
- Runtime validation (`isUserRole()` function)

## Access Control

Role-based access is managed through:
- Row Level Security (RLS) policies in the database
- Client-side route protection
- Module access controls
- Component-level permission checks

## Best Practices

1. **Always use canonical role names** - avoid legacy names like "member" or "guest"
2. **Check roles using the provided utilities** - use `hasRole()` and `canAccessModule()` functions
3. **Handle role resolution gracefully** - account for loading states when roles are being determined
4. **Log role-related navigation** - helps debug authentication flow issues

## Common Issues

### "Omdirigerer til dashboard.." Error
This typically occurs when:
- Database contains legacy role values that don't match the application's expected roles
- Role determination logic returns inconsistent values
- Navigation logic doesn't handle role loading states properly

**Solution**: Ensure all user records use canonical role values and handle loading states in navigation components.