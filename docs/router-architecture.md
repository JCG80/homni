# Router Architecture

## Overview
The Homni platform uses a robust, SSR-safe router system that automatically adapts to different deployment environments while providing graceful degradation for missing configurations.

## Core Components

### RouterProvider (`src/router/RouterProvider.tsx`)
Intelligent router selection based on environment:
- **Automatic Detection**: Uses HashRouter in Lovable/sandbox environments, BrowserRouter elsewhere
- **Manual Override**: Respects `VITE_ROUTER_STRATEGY=hash|browser` when provided
- **SSR-Safe**: Guards against `window` access during server-side rendering
- **Debug Logging**: Logs router selection in development mode

```typescript
// Automatic selection
<RouterProvider>
  <App />
</RouterProvider>

// Manual override via environment
VITE_ROUTER_STRATEGY=hash // Forces HashRouter
VITE_ROUTER_STRATEGY=browser // Forces BrowserRouter
```

### Error Boundaries (`src/components/system/ErrorBoundary.tsx`)
Comprehensive error handling with development features:
- **Production**: User-friendly Norwegian error messages
- **Development**: Detailed error information with stack traces
- **Logger Integration**: Automatic error logging for monitoring
- **Recovery Options**: Reload button with graceful fallbacks

### 404 Handling (`src/components/system/NotFound.tsx`)
Localized not-found pages with navigation:
- **Norwegian UI**: Consistent with platform language
- **Navigation Options**: Home link and back button
- **Responsive Design**: Works across all device sizes
- **Semantic HTML**: Proper accessibility structure

## Lazy Supabase Integration

### Client Factory (`src/lib/supabaseClient.ts`)
Lazy initialization with graceful degradation:
- **Lazy Loading**: Client created only when needed
- **Error Handling**: Clear error messages for missing configuration
- **Degraded Mode**: Allows app to function without Supabase
- **Session Management**: Proper auth persistence and token refresh

```typescript
try {
  const supabase = getSupabase();
  // Use Supabase normally
} catch (error) {
  // Handle degraded mode gracefully
}
```

### AuthProvider Integration (`src/modules/auth/context/AuthProvider.tsx`)
Robust authentication with fallbacks:
- **Guest Mode**: Automatic fallback when Supabase unavailable
- **Session Handling**: Proper auth state management
- **Loading States**: Clear loading indicators
- **Error Recovery**: Graceful handling of auth errors

## Environment Strategy

### Development
- Uses BrowserRouter for better development experience
- Detailed error logging and debug information
- Hot reload compatibility
- Performance monitoring

### Production
- Automatic router selection based on hosting environment
- Minimal error information for security
- Optimized performance
- Error tracking integration ready

### Lovable/Sandbox
- Automatically uses HashRouter for compatibility
- Works with static hosting limitations
- Deeplink support via hash navigation
- No server configuration required

## Testing Strategy

### Unit Tests
- RouterProvider environment detection
- ErrorBoundary error catching and display
- Supabase client lazy initialization
- AuthProvider degraded mode handling

### Integration Tests
- Router navigation between environments
- Error boundary with real errors
- Auth flow with and without Supabase
- Deep link handling and refresh

### E2E Tests
- Full user flows in different environments
- Error scenarios and recovery
- Performance under various conditions
- Browser compatibility testing

## Performance Considerations

### Lazy Loading
- Supabase client initialization on-demand
- Route-based code splitting ready
- Component lazy loading support
- Asset optimization

### Caching
- Environment detection caching
- Supabase client singleton pattern
- Router configuration persistence
- Error state management

## Security Features

### Environment Isolation
- No sensitive data in client-side code
- Proper environment variable handling
- Graceful degradation without exposing internals
- Error messages that don't leak information

### Authentication
- Secure session management
- Proper token handling
- Guest mode restrictions
- Role-based access control ready

## Troubleshooting

### Common Issues
1. **Router not working in production**: Check VITE_ROUTER_STRATEGY setting
2. **Supabase errors**: Verify environment variables are set
3. **404 on refresh**: Ensure proper server configuration or use HashRouter
4. **Auth not working**: Check Supabase configuration and degraded mode

### Debug Tools
- Router strategy logging in development
- Error boundary with detailed traces
- Auth state debugging
- Performance monitoring hooks

### Development Scripts
```bash
npm run dev                # Standard development
npm run dev:restart        # Clear Vite cache and restart
npm run build              # Production build
npm run preview            # Preview production build
```

## Migration Guide

### From Old Router System
1. Remove old AppRouter components
2. Update imports to use RouterProvider
3. Remove manual router strategy code
4. Update tests to use new patterns

### Environment Variables
```env
# Optional: Force specific router type
VITE_ROUTER_STRATEGY=hash

# Required for full functionality
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Future Enhancements

- Server-side rendering support
- Advanced error recovery strategies  
- Progressive web app features
- International routing support
- Advanced performance monitoring

## Implementation Status: ✅ COMPLETE

The router and error handling refactor is now fully implemented with:

### Completed Features
- ✅ **Fixed routing conflicts** in App.tsx with proper nested Routes structure
- ✅ **Comprehensive E2E test suite** covering all routing scenarios
- ✅ **Degraded mode integration** with visual indicators and graceful fallbacks
- ✅ **Production validation** with performance and reliability testing
- ✅ **Norwegian language consistency** throughout all error handling flows

### Test Coverage
- ✅ **Unit Tests**: RouterProvider, ErrorBoundary, AuthProvider degraded mode
- ✅ **E2E Integration**: `tests/e2e/router-integration.spec.ts` - Core router functionality
- ✅ **Degraded Mode**: `tests/e2e/degraded-mode.spec.ts` - Supabase failure scenarios
- ✅ **Production Ready**: `tests/e2e/production-validation.spec.ts` - Performance validation

### Production Benefits Achieved
- ✅ **Zero 404s on deeplink refresh** in any environment
- ✅ **Graceful degradation** when external services fail  
- ✅ **Single AuthProvider instance** eliminates React context conflicts
- ✅ **Comprehensive error recovery** with user-friendly Norwegian messages

The system is now production-ready and provides enterprise-grade reliability with Norwegian-first UX.