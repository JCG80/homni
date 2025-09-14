# Router Toggle System

## Overview
The application now uses a simple toggle system to switch between `BrowserRouter` and `HashRouter` based on environment configuration.

## Configuration

### Environment Variables
Add to Lovable Environment settings:

```
VITE_USE_HASHROUTER=true
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### When to Use HashRouter
- **Lovable Preview/Sandbox**: Always use `VITE_USE_HASHROUTER=true`
- **Static Hosting**: Use `VITE_USE_HASHROUTER=true` for GitHub Pages, etc.
- **Production with Server**: Use `VITE_USE_HASHROUTER=false` or omit

## Architecture Changes

### Simplified Provider Structure
```
main.tsx:
  └── React.StrictMode
    └── AppProviders
      └── AuthProvider (single instance)
        └── PluginSystemProvider
          └── LocalizationProvider
            └── FeatureFlagProvider
              └── Router (Hash or Browser)
                └── App (pure Routes component)
```

### Router Detection
- Uses simple environment variable `VITE_USE_HASHROUTER`
- No complex auto-detection logic
- Explicit configuration preferred

## Benefits
- ✅ Eliminates deeplink refresh 404s in sandbox
- ✅ Single AuthProvider instance (no context conflicts)
- ✅ Simplified debugging with clear provider hierarchy
- ✅ Environment-specific routing behavior
- ✅ Production-ready for both static and server hosting

## Testing
Run router tests with:
```bash
npm run test:e2e -- tests/router.spec.ts
```

## Troubleshooting
- Check environment variables are set correctly
- Verify no duplicate AuthProvider instances
- Ensure routes are defined within the Router context