# 🏥 Health Checklist - Homni Platform

## Core Health Checks

### 1. TypeScript & Build
- [ ] `npm run typecheck` - No TypeScript errors
- [ ] `npm run build` - Successful production build
- [ ] Zero `any` types without explicit justification

### 2. Code Quality
- [ ] `npm run lint` - ESLint passes with max 0 warnings
- [ ] `npm run format:check` - Prettier formatting consistent
- [ ] No duplicate files due to casing issues (TS1261)

### 3. Testing
- [ ] `npm run test:unit` - Unit test coverage ≥ 90%
- [ ] `npm run test:coverage` - Coverage gate passes
- [ ] E2E tests pass for critical user flows (optional)

### 4. Security & Dependencies
- [ ] `npm audit --audit-level=high` - No high-severity vulnerabilities
- [ ] RLS policies enabled on all user data tables
- [ ] Database functions use `SECURITY DEFINER` + `SET search_path = public`

### 5. Performance Budgets
- [ ] Frontend bundle ≤ 200KB gzipped
- [ ] Lighthouse scores ≥ 90 (Performance, Best Practices, SEO)
- [ ] API p95 latency ≤ 200ms
- [ ] Database queries p95 ≤ 100ms

### 6. Database Health
- [ ] All migrations have corresponding `_down.sql` rollback scripts
- [ ] Migration scripts tested (up and down)
- [ ] RLS guard checks pass: `npm run guard:rls`
- [ ] Function guard checks pass: `npm run guard:functions`

### 7. Documentation
- [ ] README.md updated with recent changes
- [ ] Module READMEs exist for new features
- [ ] PROMPT_LOG.md updated with Guardian-status
- [ ] API documentation current (if applicable)

### 8. Accessibility & i18n
- [ ] WCAG 2.1 AA compliance for new components
- [ ] Keyboard navigation functional
- [ ] Screen reader compatibility (ARIA labels)
- [ ] Text externalized to `locales/` for internationalization

## Quick Health Script Commands

```bash
# Quick essentials (2-3 minutes)
npm run health:quick

# Full comprehensive check (5-10 minutes)  
npm run health:full

# Repo-wide health (includes guards and duplicates)
npm run repo:health
```

## Health Status Levels

### 🟢 Green (Healthy)
- All checks pass
- Ready for production deployment
- Can proceed with new features

### 🟡 Yellow (Warning)
- Minor issues that don't block functionality
- Should be addressed before next release
- Can continue development with caution

### 🔴 Red (Critical)
- Build failures or security issues
- Must be fixed before any deployment
- Stop new development until resolved

## Automated Checks

The following checks run automatically in CI:

```yaml
# .github/workflows/ci.yml
- TypeScript compilation
- Build process
- Unit test coverage gate
- ESLint with zero warnings
- Security audit (high severity)
- Migration rollback tests
```

## Manual Review Checklist

For major changes, also verify:

- [ ] Database schema changes have been reviewed
- [ ] New API endpoints have proper error handling
- [ ] Feature flags are in place for new functionality
- [ ] Rollback plan exists for deployment
- [ ] Performance impact assessed
- [ ] Security implications considered

---

**💡 Pro tip:** Run `npm run health:quick` before every commit, and `npm run health:full` before every PR.