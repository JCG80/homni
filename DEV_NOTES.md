
# Development Notes

## Project Status Overview

### Current Focus
- **Authentication Module Refactoring**: Implementing better type safety and separation of concerns
- **Service Selection Module**: Building interactive service selection experience for users
- **Role System Implementation**: Consolidated role system with standard roles (anonymous, user, company, admin, master_admin)

### Recently Completed
- Refactored `useAuth` hook into smaller, more maintainable components
- Implemented Service Selection components with responsive grid layout
- Added lead generation for anonymous users and preference saving for authenticated users
- Fixed build errors related to authentication context types
- Consolidated role system around standard roles: anonymous, user, company, admin, master_admin
- Enhanced company role implementation with proper permissions and tests

## Module Development Status

### 1. Authentication Module

#### Completed
- ✅ Refactored `useAuth` hook into smaller, focused components
- ✅ Enhanced type safety across authentication components
- ✅ Improved error handling for authentication flows
- ✅ Created proper role-based access control system
- ✅ Implemented guest vs. authenticated user distinction
- ✅ Added profile handling with better error messaging
- ✅ Standardized user roles: anonymous, user, company, admin, master_admin
- ✅ Implemented company role with proper permissions and company profile integration

#### In Progress
- 🔄 Finalizing auth components for better type safety
- 🔄 Updating related components to use the new auth hooks

### 2. Lead Management System

#### Completed
- ✅ Lead Settings and Distribution Logic
  - Enhanced `processLeadSettings` function to respect lead settings
  - Added support for global pause settings
  - Implemented filtering capabilities based on lead categories
  - Created company settings UI component for viewing and updating lead settings
  - Added better error handling and toast notifications

- ✅ Company UI
  - Updated CompanyLeadsPage with tabs for leads and settings
  - Created CompanyLeadSettings component for controlling lead distribution
  - Added toggle to pause/resume lead distribution
  - Implemented display of current distribution strategy and budget settings

- ✅ Lead Reports
  - Created LeadReportsPage for admin users
  - Added charts for lead status and category distribution
  - Implemented time series chart for leads over time (last 30 days)
  - Added role-based access controls

#### In Progress
- 🔄 Optimizing lead distribution algorithm
- 🔄 Enhancing lead forms with service selection integration

### 3. Service Selection Module

#### Completed
- ✅ Created core components:
  - ServiceSelectorGrid: Grid layout for selecting services with icons
  - StepProgressBar: Visual indicator of progress through the selection flow
  - StepNavigationButtons: Navigation controls for moving through steps
  - OfferCountBadge: Visual indicator showing number of available offers

- ✅ Implemented service selection flow
  - Multi-step process for selecting services and providing details
  - Different paths for logged-in users vs anonymous visitors
  - Responsive design adapting to different screen sizes

#### In Progress
- 🔄 Integration with lead generation system
- 🔄 Adding more service detail options for second step

### 4. Property Management Module

#### Completed
- ✅ Property listing and details pages
- ✅ Property creation and management
- ✅ Document and expense tracking for properties
- ✅ Property transfer functionality

### 5. Content Management Module

#### Completed
- ✅ Content database table design
- ✅ Content API utilities (load, save, delete)
- ✅ Content editor with form validation
- ✅ Role-based access control for content
- ✅ Content dashboard with filtering and search
- ✅ Publishing scheduling with published_at field

## Role System

### Standard User Roles

1. **Guest** (`guest`)
   - Unauthenticated visitors
   - Access to: home, login, register, public pages, lead submission
   - Redirected to login when attempting to access protected content

2. **User** (`user`)
   - Standard authenticated private users/homeowners
   - Access to: dashboard, profile, leads management, properties, maintenance, account settings
   - Can submit and track their own leads
   - Cannot access admin or company-specific features

3. **Company** (`company`)
   - Business users who can receive and manage leads
   - Access to: dashboard, profile, company settings, lead management, reports
   - Can configure their company profile and lead preferences
   - Receives leads based on their settings and distribution rules

4. **Admin** (`admin`)
   - System administrators with elevated privileges
   - Access to: all user and company features plus admin dashboard, content management, system settings
   - Can manage leads, users, and system configuration

5. **Master Admin** (`master_admin`)
   - Super users with unrestricted access
   - Access to: everything in the system
   - No restrictions on any module or feature

## Company Role Implementation

The company role has been implemented with these specific capabilities:

- Company users have access to their own leads, which are assigned to them by the system
- They can configure preferences for lead distribution through their settings
- Each company user is linked to a company profile, which stores additional company-specific information
- Company users can view reports related to their own leads
- They cannot access user-specific functionality like property management
- They cannot access admin functionality like content management

### Company Registration Process

1. When a user registers as a business:
   - A user account is created with role='company'
   - A company profile is created in the company_profiles table
   - The user's profile is updated with a reference to the company_id
   - The user is directed to their dashboard

### Company Access Control

- Routes specific to companies are protected with role-based guards
- The `canAccessModule` function defines what modules company users can access
- Company-specific UI components check for the company role before rendering
- Redirects are in place to prevent unauthorized access
