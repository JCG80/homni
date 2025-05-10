
# Development Notes

## Lead Distribution System

### Completed Tasks

#### Phase 1: Lead Settings and Distribution Logic
- [x] Enhanced the `processLeadSettings` function to respect lead settings
- [x] Added support for global pause settings
- [x] Added filtering capabilities based on lead categories
- [x] Created company settings UI component for viewing and updating lead settings
- [x] Added better error handling and toast notifications

#### Phase 2: Company UI
- [x] Updated CompanyLeadsPage to include tabs for leads and settings
- [x] Created CompanyLeadSettings component to show and control lead distribution settings
- [x] Added toggle to pause/resume lead distribution
- [x] Added display of current distribution strategy and budget settings

#### Phase 3: Lead Reports
- [x] Created LeadReportsPage for admin users
- [x] Added charts for lead status distribution
- [x] Added charts for lead category distribution
- [x] Added time series chart for leads over time (last 30 days)
- [x] Added proper role-based access controls

#### Phase 4: Type Improvements and Refactoring
- [x] Fixed type errors in LeadSettings module
- [x] Created proper mapping between database model and application types
- [x] Added categories and zipCodes direct access to LeadSettings type
- [x] Fixed missing exports and type usage across components
- [x] Created missing useLeadsReport hook for LeadReportsPage
- [x] Added type safety for accessing lead properties
- [x] Fixed Badge styling to use variant="default" with custom classes
- [x] Updated LeadSettings interface to properly match both UI needs and database schema
- [x] Refactored LeadSettingsForm into smaller, more focused components
- [x] Created separate components for strategy selection, budget inputs, and distribution toggles
- [x] Extracted form logic to a custom hook for better reusability
- [x] Fixed LeadSettingsPage import issues and component props
- [x] Updated useLeadSettings hook for better error handling and state management

#### Phase 5: Geo Services
- [x] Implemented modulbasert adresseoppslagstjeneste (addressLookup)
- [x] Created provider interface for address lookup services
- [x] Implemented NO.ts provider for Norwegian addresses
- [x] Added DEFAULT.ts fallback provider
- [x] Created tests for address lookup functionality

#### Phase 6: Lead Status Type Safety
- [x] Implemented strict typing for LeadStatus using string literal union type
- [x] Added isValidLeadStatus() validation function to ensure status safety
- [x] Updated data fetching to validate and safely cast status values
- [x] Made status handling consistent across components and database
- [x] Improved processLeads.ts to handle status validation
- [x] Documented proper status validation pattern in DEV_NOTES.md

#### Phase 7: Testing Setup
- [x] Configured Vitest for unit testing
- [x] Set up testing for address lookup module
- [x] Added explicit imports for test functions in test files
- [x] Created vitest.config.ts with proper configuration

#### Phase 8: Type Safety and Error Fixes
- [x] Fixed TS2589 error: "Type instantiation is excessively deep and possibly infinite"
- [x] Created modular parseLead utility for safe Lead object creation
- [x] Implemented proper type safety in API functions
- [x] Added test suite for parseLead utility
- [x] Updated documentation to reflect new type-safe patterns
- [x] Removed direct casting (as Lead[]) in favor of explicit parsing
- [x] Added robust fallbacks for missing or invalid data fields
- [x] Updated README with new best practices for type safety

#### Phase 9: Content Management Module
- [x] Created content management module structure
- [x] Added content database table design
- [x] Implemented content API utilities (load, save, delete)
- [x] Created content editor component with form validation
- [x] Added role-based access control for content management
- [x] Implemented content dashboard with filtering and search
- [x] Created tests for content parsing utility
- [x] Added support for publishing scheduling with published_at field
- [x] Updated role utility to include editor role with content module access
- [x] Added proper error handling and toast notifications

#### Phase 10: Role-Based Access Control Enhancement
- [x] Added 'guest' as a distinct role for unauthenticated users
- [x] Updated ProtectedRoute to properly handle anonymous vs. authenticated users
- [x] Enhanced module access with specific permissions for anonymous users
- [x] Created unit tests for anonymous role permissions
- [x] Fixed role handling in useAuth hook for better type safety
- [x] Streamlined role management to use a single source of truth
- [x] Fixed type issues in LoginPage.tsx and other auth components
- [x] Updated UserRole throughout the application for consistency

#### Phase 11: Auth Module Refactoring (Current Focus)
- [x] Refactored useAuth hook to provide more type safety and clarity
- [x] Fixed ProtectedRoute component to properly handle role-based access
- [x] Updated LoginPage to use correct UserRole enum values
- [x] Standardized role checking logic across the application
- [x] Updated Authenticated component for better profile handling
- [x] Added proper error messaging for missing or invalid profiles
- [x] Enhanced error handling across authentication flows
- [x] Improved UX for profile creation and error states

### Testing Notes
- Tested distribution strategy selection with both "roundRobin" and "category_match"
- Verified that the global pause feature correctly prevents new leads from being distributed
- Confirmed that the company UI correctly shows the current settings
- Validated that the reports page correctly aggregates data
- Tested address lookup functionality with Norwegian provider and fallback
- Validated that LeadStatus values are properly checked and fallback to 'new' when invalid
- Validated that parseLead correctly handles valid and invalid status values
- Confirmed that missing fields are handled gracefully with sensible defaults
- Verified that API functions return properly parsed Lead objects
- Tested content management system with all role types
- Verified content editor properly validates input fields
- Confirmed scheduled publishing functionality works correctly
- Tested authentication flows with different user roles
- Verified that ProtectedRoute correctly restricts access based on roles

### Current In-Progress Tasks
- [ ] Refactor remaining auth components for better type safety
- [ ] Enhance project documentation with up-to-date status
- [ ] Fix LeadSettingsPage component to use correct hook and props

### Pending Tasks
- [ ] Add more test coverage for lead distribution functions
- [ ] Create tests for lead status transitions
- [ ] Implement the budget utilization feature
- [ ] Add more detailed filtering options for lead distribution
- [ ] Create better visualization for company performance
- [ ] Add export functionality for lead reports
- [ ] Implement notification system for new leads
- [ ] Add more address lookup providers (SE, DK, etc.)
- [ ] Create similar parsing functions for other entities (CompanyProfile, LeadSettings, etc.)
- [ ] Add content preview feature before publishing
- [ ] Implement rich text editor for content editing
- [ ] Add image upload capability to content module

## Roadmap

### Short-term (Next 2-4 weeks)
1. Complete the budget tracking system
2. Implement lead quality scoring
3. Add more detailed reporting for companies
4. Expand test coverage for critical modules
5. Extend parsing utilities to other entity types
6. Enhance content publishing workflow with approval steps
7. Add media library for content images
8. Fix any remaining type issues in auth modules

### Mid-term (Next 2-3 months)
1. Implement AI-based lead matching algorithm (priority high)
2. Create mobile-responsive design for all pages
3. Add notification system for important events
4. Implement advanced filtering and search across the application
5. Add data export capabilities for reports
6. Create dashboard widgets for key metrics

### Long-term
1. Implement AI-based lead matching
2. Create a mobile app for companies to manage leads on-the-go
3. Integrate with CRM systems
4. Implement a bidding system for leads
5. Create more advanced content management features like versioning and scheduling

## Type Safety Examples

### Safe Lead Status Handling

When processing leads from the database:

```typescript
// Unsafe approach (don't do this)
const leads = apiData as Lead[]; // Might include invalid status values

// Safe approach (do this)
const leads = apiData.map(item => ({
  ...item,
  status: isValidLeadStatus(item.status) ? item.status : 'new',
})) as Lead[];
```

### Safe Lead Parsing

```typescript
// Previously (unsafe approach - don't do this)
const leads = apiData as Lead[]; // Might cause TS2589 error

// Now (safe approach - do this)
import { parseLead } from '../utils/parseLead';
const leads = (apiData || []).map(parseLead);
```

### Type Guards Usage

```typescript
// Type guard for LeadStatus
function isValidLeadStatus(value: any): value is LeadStatus {
  return LEAD_STATUSES.includes(value);
}

// Example usage
function processLeadStatus(status: unknown) {
  if (isValidLeadStatus(status)) {
    // TypeScript now knows status is LeadStatus
    return `Valid status: ${status}`;
  } else {
    return 'Invalid status';
  }
}
```

### Content Type Guard Example

```typescript
// Type guard for ContentType
function isValidContentType(value: any): value is ContentType {
  return ['article', 'news', 'guide'].includes(value);
}

// Safe parsing with type guard
function parseContent(data: any): Content {
  return {
    ...data,
    type: isValidContentType(data.type) ? data.type : 'article',
  };
}
```

## Testing Examples

### Running Tests
To run tests, you'll need to use Vitest directly:

```bash
npx vitest run
# Or for a specific test file
npx vitest run src/modules/geo/__tests__/addressLookup.test.ts
```

### Test Structure
```typescript
import { describe, test, expect } from 'vitest';

describe('Module name', () => {
  test('should do something', () => {
    expect(1 + 1).toBe(2);
  });
});
```

## Role-Based Access System

### Guest vs. Authenticated Roles

The system now distinguishes between:

- `guest`: Non-authenticated visitors who can access public pages like home, lead submission forms, and public information
- `member`: Authenticated individuals who can access personal dashboards and lead history

This separation allows for:
1. Better security through explicit role definitions
2. Improved user experience with clear access boundaries
3. Support for public-facing content without requiring authentication
4. Type-safe role handling throughout the application

### Role Access Implementation

```typescript
// Define what modules each role can access
function getAllowedModulesForRole(role: UserRole): string[] {
  switch (role) {
    case 'guest':
      return ['home', 'leads/submit', 'info'];
    case 'member':
      return ['dashboard', 'leads'];
    // Other roles...
  }
}

// Check if a specific role can access a module
function canAccessModule(role: UserRole, module: string): boolean {
  const allowed = getAllowedModulesForRole(role);
  return allowed.includes('*') || allowed.includes(module);
}
```
