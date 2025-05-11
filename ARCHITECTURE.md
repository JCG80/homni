
# Homni Architecture

## Module Architecture

Homni uses a modular architecture where functionality is organized into feature modules. Each module is a self-contained unit with its own components, hooks, services, and utilities.

### Module Structure

Each module follows this standard structure:

```
/src/modules/[module-name]/
  /api/       - API functions and data fetching
  /components/ - React components specific to the module
  /hooks/     - Custom React hooks
  /pages/     - Route pages
  /types/     - TypeScript type definitions
  /utils/     - Utility functions
  /context/   - Context providers (if needed)
```

### Core Modules

1. **auth** - Authentication and user management
2. **leads** - Lead management and processing
3. **insurance** - Insurance comparison and quotes
4. **company** - Company management and profiles
5. **user** - User profiles and settings
6. **services** - Service selection and configuration

### Module Registry

The ModuleRegistry system tracks all available modules and their metadata:

```typescript
interface ModuleDefinition {
  id: string;
  displayName: string;
  rolesAllowed: UserRole[];
  dependencies: string[];
  enabled: boolean;
}
```

### Adding a New Module

To add a new module to the system:

1. Create the module folder structure in `/src/modules/`
2. Add module-specific components, hooks, and services
3. Register the module in the ModuleRegistry
4. Add necessary routes in `Routes.tsx`
5. Update role permissions in `getAllowedModulesForRole()`
6. Add database tables/fields if necessary

### Example: Creating a New Module

Here's an example of adding a new "notifications" module:

1. Create the folder structure:
   ```
   /src/modules/notifications/
     /api/
     /components/
     /hooks/
     /pages/
     /types/
     /utils/
   ```

2. Create the main types:
   ```typescript
   // src/modules/notifications/types/index.ts
   export interface Notification {
     id: string;
     userId: string;
     message: string;
     read: boolean;
     createdAt: string;
   }
   ```

3. Create API services:
   ```typescript
   // src/modules/notifications/api/index.ts
   import { supabase } from '@/integrations/supabase/client';
   import { Notification } from '../types';
   
   export async function fetchUserNotifications(userId: string): Promise<Notification[]> {
     const { data, error } = await supabase
       .from('notifications')
       .select('*')
       .eq('user_id', userId)
       .order('created_at', { ascending: false });
       
     if (error) throw error;
     return data || [];
   }
   ```

4. Register the module in ModuleRegistry
5. Add database tables for the new module
6. Update permissions to allow access to the module

### Module Dependencies

Modules can depend on other modules. The system ensures that all dependencies are loaded before a module is initialized.

## Role-Based Access Control

Access to modules is controlled by the role-based permission system defined in `src/modules/auth/utils/roles/`.

## Feature Flags

Feature flags are stored in the database and checked during module initialization to determine which modules should be active for specific users or roles.
