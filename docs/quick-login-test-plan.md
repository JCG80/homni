
# Quick Login Test Plan

## Overview
This test plan outlines the manual and automated verification steps for the QuickLogin component, which allows developers to quickly sign in as different users in development mode.

## Setup Requirements
1. Supabase project with seeded test users
2. Application running in development mode

## Manual Verification Steps

### Basic Login Flow
1. Start the application in development mode
2. Navigate to the login page (/login)
3. Click on the "Quick Login" button in the developer tools section
4. Verify a dropdown menu appears with a list of users
5. Click on a user from the list
6. Verify you are redirected to the appropriate dashboard based on user role
7. Verify the authenticated user information is correct

### Search Functionality
1. Navigate to the login page (/login)
2. Click on the "Quick Login" button
3. Enter a search term in the search box
4. Verify the list filters correctly to match users with the search term
5. Clear the search box
6. Verify all users are shown again

### Role-Specific Routing
1. Login as a master admin user
   - Verify redirection to /dashboard/master_admin
   - Verify admin-specific UI elements are visible
2. Login as an admin user
   - Verify redirection to /dashboard/admin
   - Verify admin-specific UI elements are visible
3. Login as a company user
   - Verify redirection to /dashboard/company
   - Verify company-specific UI elements are visible
4. Login as a regular member user
   - Verify redirection to /dashboard/member
   - Verify member-specific UI elements are visible

### Dashboard Content
For each role, verify the corresponding dashboard loads with the following elements:
1. **Master Admin Dashboard**
   - System settings
   - User management
   - Feature flag management
   
2. **Admin Dashboard**
   - User management
   - Content management
   
3. **Company Dashboard**
   - Lead management
   - Subscription information
   
4. **Member Dashboard**
   - Kanban board (ensure the feature flag is enabled)
   - Personal settings

## Automated Testing
The automated E2E tests verify:
1. QuickLogin component renders correctly
2. Users can be searched and filtered
3. Login redirects to the appropriate dashboard
4. Dashboard content is visible after login

## Error Handling
Verify the following error scenarios:
1. When the user list fails to load, an error message should be displayed
2. When login fails, an appropriate error toast should be shown

## Production Behavior
Verify that the QuickLogin component is not visible in production mode (build).
