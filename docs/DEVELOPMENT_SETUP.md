# Development Setup Guide

## VS Code Workspace Setup

This project includes a comprehensive VS Code workspace configuration for optimal development experience.

### Quick Start

1. **Open in VS Code**: Open the project folder in VS Code
2. **Install Extensions**: Accept the recommended extensions when prompted
3. **Start Debugging**: Press `F5` or use Debug menu → "Launch Chrome against localhost"

### Debug Configurations

#### Chrome Debugging
- **Launch Chrome**: Starts dev server and opens Chrome with debugging enabled
- **Attach to Chrome**: Attach to existing Chrome instance (requires `--remote-debugging-port=9222`)

#### Node.js Debugging  
- **Run Tests**: Debug Vitest tests
- **Debug Script**: Debug any script in the `scripts/` folder

### VS Code Features

#### Automatic Tasks
- `dev-server`: Starts Vite dev server automatically when debugging
- `build`: Production build
- `test`: Run test suite
- `lint`: ESLint checking
- `typecheck`: TypeScript validation
- `seed-users`: Populate test users

#### Editor Settings
- Auto-format on save with Prettier
- ESLint auto-fix on save
- Organize imports automatically
- Tailwind CSS IntelliSense
- TypeScript path mapping support

#### File Nesting
- Test files nest under source files
- Config files are grouped logically
- Reduces clutter in Explorer

## Development Debugging

### Debug Tool Usage

```bash
# Show complete debug information
npm run dev:debug info

# Test authentication only
npm run dev:debug auth

# Test database connection only  
npm run dev:debug db

# Run all tests and show info
npm run dev:debug all
```

### Environment Validation

```bash
# Validate environment setup
npm run validate:env

# Test database health
npm run health:connections
```

### Multi-Role Testing

```bash
# Test access for all user roles
npm run test:role-access

# Seed test users for development
npm run seed:users
```

## Port Configuration

- **Development Server**: http://localhost:8080
- **Vite default**: 5173 (overridden to 8080)
- **Chrome Remote Debugging**: 9222

## Debugging Checklist

### Before Starting Development

- [ ] Environment variables configured (`.env.local`)
- [ ] Supabase connection working
- [ ] Test users seeded
- [ ] Extensions installed and enabled
- [ ] TypeScript service running

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 8080
npx kill-port 8080

# Or use different port
npm run dev -- --port 3000
```

#### Sourcemaps Not Working
- Ensure `vite.config.ts` has `sourcemap: true` in development
- Check Chrome DevTools → Sources → Show ignore-listed sources

#### TypeScript Errors
```bash
# Regenerate Supabase types
npm run types:generate

# Full TypeScript check
npm run typecheck
```

#### Supabase Connection Issues
```bash
# Debug Supabase connection
npm run dev:debug db

# Check RLS policies
npm run guard:rls
```

## Performance Tips

### Hot Reload Optimization
- Use `React.memo()` for expensive components
- Optimize re-renders with `useCallback` and `useMemo`
- Check for infinite loops in `useEffect`

### Build Optimization
- Bundle analysis: `npm run build -- --analyze`
- Tree-shaking verification in production build
- Lazy load routes and modules

### Database Performance
- Use indexes for frequently queried columns
- Monitor slow queries in Supabase dashboard
- Optimize RLS policies for performance

## VS Code Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Start Debugging | `F5` |
| Run Tests | `Ctrl+Shift+T` |
| Toggle Terminal | `Ctrl+`` |
| Command Palette | `Ctrl+Shift+P` |
| Quick Open | `Ctrl+P` |
| Format Document | `Shift+Alt+F` |
| Organize Imports | `Shift+Alt+O` |

## Recommended Workflow

1. **Start Development**:
   ```bash
   npm run dev
   ```

2. **Set Breakpoints**: Click in gutter or use `F9`

3. **Debug in Chrome**: Press `F5` to launch Chrome debugger

4. **Test Changes**: 
   ```bash
   npm run test:watch
   ```

5. **Check Quality**:
   ```bash
   npm run lint
   npm run typecheck
   ```

6. **Commit Changes**: Use conventional commits format

This setup provides a professional development environment with debugging, testing, and quality tools integrated seamlessly.