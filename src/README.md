
# Homni Application

## Modules

The application is organized into modular components each with their own responsibility:

- **auth**: Authentication and user management
- **leads**: Lead management, processing, and distribution
- **content**: Content management for articles, pages, and other content
- **system**: System administration and configuration
- **user**: User and company management

## Error Handling & Retry Logic

This application implements comprehensive error handling:

### API Retry Logic

All API calls use a retry mechanism that attempts up to 3 retries with exponential backoff when network or server errors occur. This is implemented via:

- The `useApiCall` hook for React components
- Retry logic in the TanStack Query client configuration
- Direct retry implementations in critical API functions

### Global Error Boundary

A React ErrorBoundary catches unhandled errors in the component tree and displays a user-friendly error page with options to:
- Reload the page
- Go back and try again
- See detailed error information (development mode only)

### Toast Notifications

Toast notifications provide feedback for:
- Successful operations
- Failed operations with friendly error messages
- Important state changes

## Duplicate Control

The codebase follows these principles to avoid duplication:

- Centralized utility functions in `/src/utils`
- Shared components in `/src/components`
- Module-specific components in their respective `/components` directories
- Shared hooks in `/src/hooks`
- Module-specific hooks in their respective `/hooks` directories

The utilities in `duplicateDetector.ts` can be used during development to identify potential code duplication.

## Module Structure

Each module follows this structure:

```
/src/modules/[module-name]/
  /api/       - API functions
  /components/ - React components
  /hooks/     - Custom React hooks
  /pages/     - Route pages
  /types/     - TypeScript types
  /utils/     - Utility functions
  /__tests__/ - Unit tests
```

## Build & Type Safety

- TypeScript is used throughout the codebase for type safety
- Components use prop validation
- API responses are validated before use
- Tests ensure functionality remains correct
