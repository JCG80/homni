# Mobile/PC Parity Validation Guide

## Overview

This document outlines the Mobile/PC Parity Guardrails implementation for the HOMNI platform, ensuring consistent behavior across desktop and mobile devices.

## Implementation Status ✅

### Phase 1: Router & Deep-link Fixes
- ✅ Token cleanup utility (`src/app/stripToken.ts`)
- ✅ Consolidated routing with `useRoutes()` 
- ✅ Enhanced router debugging and diagnostics
- ✅ Environment-driven router mode switching

### Phase 2: Service Worker & Cache Management  
- ✅ Service worker cleanup for dev/preview (`src/pwa/cleanup.ts`)
- ✅ Cache clearing utilities
- ✅ Development environment self-healing

### Phase 3: Environment & CORS Validation
- ✅ Pre-build environment validation (`scripts/checkEnvAndCors.mjs`)
- ✅ CORS preflight testing
- ✅ Deployment configuration templates

### Phase 4: Repository Health & Enforcement
- ✅ Automated health checks (`scripts/repo-health.mjs`)
- ✅ Router violation detection
- ✅ Pre-deployment validation pipeline

### Phase 5: E2E Testing & Validation
- ✅ Mobile/PC parity test suite (`e2e-tests/mobile-pc-parity.spec.ts`)
- ✅ Cross-device responsive testing
- ✅ Performance validation
- ✅ CI/CD integration

### Phase 6: Deployment & Documentation
- ✅ Hosting configuration templates (Netlify, Vercel, Apache, Nginx)
- ✅ Environment variable management
- ✅ Deployment checklists and troubleshooting guides

## Key Features Implemented

### 🔧 Token Cleanup System
Automatically removes `__lovable_token` from URLs after app initialization:
```typescript
// Automatically called on app mount
stripLovableToken();
```

### 🛣️ Unified Routing System
Single router instance using `useRoutes()` with route objects:
```typescript
// Shell.tsx now uses unified routing
const routes = useRoutes(routeElements);
```

### 🧹 Service Worker Self-Healing
Prevents stale cache issues in development:
```typescript
// Cleans up service workers in dev/preview
await performDevCleanup();
```

### ✅ Pre-deployment Validation
Comprehensive checks before deployment:
```bash
npm run check:env     # Environment & CORS validation
npm run check:health  # Repository health check
npm run check:deploy  # Combined pre-deployment check
```

### 🧪 E2E Parity Testing
Automated tests for mobile/PC consistency:
```bash
npm run test:e2e:parity    # Run parity-specific tests
npm run test:e2e:full      # Full E2E test suite
```

## Usage

### Development Workflow
1. **Start development**: App automatically cleans up tokens and service workers
2. **Make changes**: Health checks prevent router violations
3. **Pre-commit**: Repository health validation runs
4. **Before deployment**: Run `npm run check:deploy`

### CI/CD Integration
The following GitHub Actions workflow validates Mobile/PC parity:
- Environment & CORS validation
- Repository health checks  
- Build validation (both router modes)
- E2E parity testing
- Security auditing

### Deployment Checklist
- [ ] Environment variables configured correctly
- [ ] Router mode matches hosting platform
- [ ] Rewrites/redirects configured
- [ ] All health checks passing
- [ ] E2E tests green
- [ ] Deep links tested on target platform

## Troubleshooting

### Common Issues Fixed

**Blank pages on direct URL access**
- ✅ Fixed with proper SPA rewrites configuration
- ✅ Environment-driven router mode selection

**Token persistence in URLs**
- ✅ Automatic token cleanup on app initialization
- ✅ Clean history state management

**Service worker cache issues**
- ✅ Development cleanup utilities
- ✅ Selective cache clearing

**Router violations**
- ✅ Automated detection and prevention
- ✅ Single router instance enforcement

### Debug Commands
```bash
# Check current router configuration
npm run analyze:routes

# Clean development cache
npm run clean:cache

# Validate environment setup
npm run check:env

# Run health diagnostics
npm run check:health
```

## Monitoring & Metrics

### Performance Targets
- Route navigation: < 3 seconds
- Token cleanup: < 100ms
- Service worker cleanup: < 500ms
- Health check execution: < 10 seconds

### Success Metrics
- ✅ Zero blank pages on direct URL access
- ✅ Clean URLs without token artifacts  
- ✅ Single router instance across codebase
- ✅ 100% CI pass rate for validation checks
- ✅ Cross-device responsive compatibility

## Future Enhancements

### Planned Improvements
- Real-time performance monitoring
- Advanced cache strategies
- Progressive Web App enhancements
- Deeper mobile optimization

### Maintenance Tasks
- Monthly dependency audits
- Quarterly health check reviews
- Annual performance benchmark updates
- Continuous deployment pipeline refinements

## Support & Documentation

For additional support:
- Review hosting configuration templates in `docs/deployment/`
- Check CI workflow status in GitHub Actions
- Run diagnostic commands for specific issues
- Consult troubleshooting guides for platform-specific problems

---

**Status**: ✅ Complete - Mobile/PC Parity Guardrails fully implemented and validated