
# Definition of Done

This document outlines the specific acceptance criteria that must be met for a feature, module, or task to be considered complete in the Homni project.

## Code Quality Standards

| Criterion | Acceptance Threshold | Validation Method |
|-----------|---------------------|-------------------|
| Code Linting | No linting errors | `npm run lint` |
| Code Formatting | No formatting issues | `npm run format:check` |
| Type Safety | No TypeScript errors | `npx tsc --noEmit` |
| Component Size | ≤ 150 lines per file | Manual review |
| Build Status | Successful build | `npm run build` |

## Testing Requirements

| Criterion | Acceptance Threshold | Validation Method |
|-----------|---------------------|-------------------|
| Unit Test Coverage | ≥ 90% | Test coverage report |
| Integration Tests | Critical paths covered | Required test cases documented |
| E2E Tests | Happy path workflows covered | Playwright test suite |
| Manual Testing | All acceptance criteria verified | QA checklist |

## Database & Migration Standards

| Criterion | Acceptance Threshold | Validation Method |
|-----------|---------------------|-------------------|
| Migrations | Forward migration runs successfully | CI pipeline validation |
| Rollback Scripts | Every migration has a valid rollback script | CI pipeline validation |
| RLS Policies | Applied for all tables with data access | Security test cases |
| Type Generation | TypeScript types updated | `npm run generate:types` |
| Seed Scripts | Test users for all roles created | Seed script verification |

## Documentation Requirements

| Criterion | Acceptance Threshold | Validation Method |
|-----------|---------------------|-------------------|
| API Docs | OpenAPI spec updated | `docs/api/openapi.yaml` |
| README Updates | Module README updated | File exists and is current |
| JSDoc Comments | Public functions documented | Coverage check |
| Inline Comments | Complex logic explained | Code review |
| Usage Examples | At least one example per module | Documentation review |

## Security & QA Standards

| Criterion | Acceptance Threshold | Validation Method |
|-----------|---------------------|-------------------|
| SAST Scan | No high or critical issues | GitHub CodeQL |
| Dependency Check | No high or critical vulnerabilities | `npm audit` |
| Authorization Tests | All role access correctly enforced | Role-based test suite |
| Data Validation | All inputs properly validated | Security test cases |
| Error Handling | Graceful error handling | Error injection tests |

## Performance & Accessibility

| Criterion | Acceptance Threshold | Validation Method |
|-----------|---------------------|-------------------|
| Page Load Time | < 1.5s on desktop | Performance testing |
| API Response Time | < 500ms for 95% of requests | API benchmarks |
| WCAG Compliance | AA level | Accessibility audit |
| i18n Support | All UI strings externalized | Translation file check |
| Mobile Responsiveness | Works on major device sizes | Responsive design check |

## Release Process

| Criterion | Acceptance Threshold | Validation Method |
|-----------|---------------------|-------------------|
| PR Format | Follows convention | PR template check |
| Commit Messages | Follows Conventional Commits | Git hook validation |
| Feature Flag | New features behind flags | Feature flag check |
| Staging Deployment | Successful staging deployment | CI pipeline |
| Production Approval | Signed off by product owner | Approval workflow |

## Module-Specific Requirements

### Auth Module

- All 6 roles properly implemented (guest, user, company, content_editor, admin, master_admin)
- Role-based access correctly enforced for all routes
- Login/logout/registration flows function correctly
- Password reset and account management work as expected

### Leads Module

- Lead submission workflow completes successfully
- Lead assignment respects company settings
- Lead status transitions work correctly
- Filtering and sorting options function properly

### Company Module

- Company profile management works correctly
- Company settings are properly applied
- Module access is correctly restricted by subscription

### Content Module

- Content creation and editing work properly
- Publishing workflow functions correctly
- Content is properly displayed to appropriate users

### Dashboard Module

- Appropriate dashboard shown based on user role
- All dashboard widgets load data correctly
- Dashboard customization options work properly

## Commit and PR Conventions

### Commit Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types include:
- feat: A new feature
- fix: A bug fix
- docs: Documentation changes
- style: Code style changes (formatting, etc.)
- refactor: Code changes that neither fix bugs nor add features
- perf: Performance improvements
- test: Adding or modifying tests
- build: Changes to the build system or dependencies
- ci: Changes to CI configuration
- chore: Other changes that don't modify src or test files

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/[name]`: New functionality
- `bugfix/[name]`: Bug fixes
- `release/[version]`: Release preparation
- `hotfix/[name]`: Urgent production fixes

### Pull Request Template

Each PR should include:
1. Clear title describing the change
2. Detailed description of what was changed and why
3. Testing instructions
4. Screenshots (for UI changes)
5. Checklist of acceptance criteria met
