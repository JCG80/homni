# Complete Development Workflow Guide

## 🚀 Daily Development Workflow

### 1. Morning Setup
```bash
# Start your development session
npm run dev                    # Start dev server
npm run dev:debug info         # Check system status
npm run seed:users             # Ensure test users exist
```

### 2. VS Code Development
```bash
# Launch VS Code with full debugging
code .                         # Open project
# Press F5 to start Chrome debugging
```

### 3. Development Cycle
```bash
# Make changes in VS Code
# Auto-format and lint on save is configured

# Test your changes
npm run test:watch             # Continuous testing
npm run typecheck              # TypeScript validation
npm run lint                   # Code quality check
```

### 4. Database Changes
```bash
# When adding new features requiring DB changes
# Use Supabase migration tool in Lovable interface
# Then regenerate types
npm run types:generate
```

### 5. Performance Monitoring
```bash
# Check performance during development
npm run perf:monitor test      # Single performance test
npm run perf:monitor bundle    # Check bundle size
```

### 6. Pre-commit Checks
```bash
# Before committing code
npm run lint:fix               # Fix auto-fixable issues
npm run format                 # Format all files
npm run typecheck              # Ensure type safety
npm run test                   # Run full test suite
```

## 🔄 Complete Development Cycles

### Feature Development Cycle

#### Phase 1: Planning & Setup
1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature-name
   ```

2. **Setup Development Environment**
   ```bash
   npm run dev:debug all         # Verify all systems
   npm run seed:advanced --reset # Fresh test data if needed
   ```

3. **Plan Database Changes** (if needed)
   - Review existing schema
   - Plan RLS policies
   - Use Supabase migration tool

#### Phase 2: Development
1. **Start Debugging Session**
   - Open VS Code
   - Press F5 to start Chrome debugging
   - Set breakpoints in your code

2. **Iterative Development**
   ```bash
   # Continuous feedback loop
   npm run test:watch            # Tests running
   npm run perf:monitor monitor  # Performance monitoring (optional)
   ```

3. **Database Integration**
   - Use migration tool for schema changes
   - Update RLS policies
   - Regenerate types: `npm run types:generate`

#### Phase 3: Quality Assurance
1. **Code Quality**
   ```bash
   npm run lint:fix              # Fix linting issues
   npm run format                # Format code
   npm run typecheck             # TypeScript validation
   ```

2. **Testing**
   ```bash
   npm run test                  # Unit tests
   npm run test:coverage         # Coverage report
   npm run e2e                   # End-to-end tests
   npm run test:role-access      # Multi-role testing
   ```

3. **Security & Performance**
   ```bash
   npm run guard:rls             # RLS policy validation
   npm run security:audit        # Security check
   npm run perf:monitor test     # Performance check
   ```

#### Phase 4: Pre-deployment
1. **Build Validation**
   ```bash
   npm run build                 # Production build
   npm run deploy:check          # Deployment readiness
   ```

2. **Final Testing**
   ```bash
   npm run test:env              # Environment validation
   npm run health:connections    # Connection health
   ```

3. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: implement new feature"
   git push origin feature/new-feature-name
   ```

### Bug Fix Cycle

#### Quick Bug Fixes
```bash
git checkout -b bugfix/issue-123-fix-login

# Debug the issue
npm run dev:debug auth          # If auth-related
npm run dev:debug db            # If database-related

# Make fixes in VS Code with F5 debugging
# Test the fix
npm run test                    # Relevant tests
npm run lint:fix                # Code quality

# Commit
git commit -m "fix: resolve login issue"
git push origin bugfix/issue-123-fix-login
```

#### Complex Bug Investigation
```bash
# Comprehensive debugging session
npm run dev:debug all           # System overview
npm run perf:monitor test       # Performance check
npm run repo:health             # Repository health

# Use VS Code debugging extensively
# Set breakpoints, inspect variables
# Check network requests in DevTools

# Document findings
# Fix with proper tests
# Validate fix doesn't break other features
```

## 🛠️ Advanced Development Techniques

### Multi-Role Development
```bash
# Test feature across all user roles
npm run seed:advanced --users=20 --companies=5
npm run test:role-access

# Switch between test users in dev
# Use QuickLogin component for rapid switching
```

### Performance Optimization Workflow
```bash
# Before optimization
npm run perf:monitor test       # Baseline metrics
npm run build                   # Current bundle size

# Make optimizations
# Code splitting, lazy loading, memoization

# After optimization
npm run perf:monitor test       # Compare metrics
npm run perf:monitor bundle     # Bundle analysis
```

### Database Development
```bash
# Database-heavy feature development
npm run dev:debug db            # Verify connection
# Use Supabase migration tool for schema changes
npm run guard:rls               # Validate RLS policies
npm run security:audit          # Security check
npm run types:generate          # Update TypeScript types
```

## 🔍 Debugging Strategies

### Frontend Issues
1. **Use VS Code Chrome Debugging**
   - Press F5 to launch
   - Set breakpoints in TypeScript source
   - Inspect React component state/props
   - Check network requests

2. **Console Debugging**
   ```bash
   # Check for errors
   npm run dev:debug info
   ```

### Backend/Database Issues
1. **Supabase Debugging**
   ```bash
   npm run dev:debug db          # Connection test
   npm run dev:debug auth        # Auth test
   ```

2. **RLS Policy Issues**
   ```bash
   npm run guard:rls             # Policy validation
   npm run test:role-access      # Multi-role testing
   ```

### Performance Issues
```bash
npm run perf:monitor test       # Performance metrics
npm run perf:monitor bundle     # Bundle analysis
npm run perf:monitor monitor    # Continuous monitoring
```

## 📋 Quality Gates

### Before Every Commit
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes  
- [ ] `npm run test` passes
- [ ] Manual testing in browser
- [ ] Check for console errors

### Before Every PR
- [ ] `npm run test:coverage` ≥ 80%
- [ ] `npm run e2e` passes
- [ ] `npm run deploy:check` is green
- [ ] `npm run security:audit` passes
- [ ] Performance acceptable

### Before Every Release
- [ ] `npm run build` succeeds
- [ ] All CI/CD checks pass
- [ ] Staging deployment tested
- [ ] Security scan clean
- [ ] Performance benchmarks met

## 🎯 Pro Tips

### VS Code Power Features
- **Multi-cursor editing**: Alt+Click for multiple cursors
- **Command Palette**: Ctrl+Shift+P for all commands
- **Quick Open**: Ctrl+P for fast file navigation
- **Integrated Terminal**: Ctrl+` for terminal access
- **Debugging**: F5 to start, F9 for breakpoints

### Git Workflow
```bash
# Feature branch from main
git checkout main
git pull origin main
git checkout -b feature/description

# Regular commits
git add .
git commit -m "feat: descriptive message"

# Rebase before PR
git rebase main
git push origin feature/description
```

### Performance Monitoring
- Monitor bundle size growth
- Track API response times
- Watch for memory leaks
- Monitor database query performance

This workflow ensures consistent, high-quality development with comprehensive debugging and testing at every step.