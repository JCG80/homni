# Development Setup Guide

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ with npm/yarn/bun
- **Git** for version control
- **Supabase CLI** for database management
- **VS Code** (recommended) with extensions

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd homni-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env.local
   # Fill in your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Environment Configuration

### Required Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0

# Feature Flags (optional)
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_MOCK_DATA=true
```

### Supabase Setup

1. **Create Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Copy URL and anon key to `.env.local`

2. **Initialize local database**
   ```bash
   npx supabase init
   npx supabase start
   ```

3. **Run migrations**
   ```bash
   npx supabase db reset
   ```

4. **Seed test data**
   ```bash
   npm run seed:users
   ```

## 🏗 Project Structure

```
homni-platform/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (shadcn)
│   │   ├── forms/          # Form components
│   │   ├── layout/         # Layout components
│   │   └── dashboard/      # Dashboard-specific components
│   ├── modules/            # Feature modules
│   │   ├── auth/           # Authentication module
│   │   ├── leads/          # Lead management module
│   │   ├── admin/          # Admin functionality
│   │   └── property/       # Property documentation
│   ├── pages/              # Route-level page components
│   ├── routes/             # Routing configuration
│   ├── lib/                # Utilities and integrations
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   └── styles/             # CSS and styling
├── supabase/
│   ├── migrations/         # Database schema changes
│   ├── functions/          # Edge functions
│   └── config.toml         # Supabase configuration
├── docs/                   # Documentation
├── scripts/                # Build and utility scripts
└── tests/                  # Test files
```

## 🧪 Development Workflow

### Running the Application

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check types
npm run type-check
```

### Database Operations

```bash
# Reset database to latest migrations
npx supabase db reset

# Create new migration
npx supabase migration new <migration_name>

# Generate TypeScript types from database
npm run generate-types

# Seed test data
npm run seed:users
```

## 🔍 Development Tools

### VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "supabase.supabase"
  ]
}
```

### Browser Extensions

- **React Developer Tools** - Component debugging
- **Supabase DevTools** - Database inspection
- **Redux DevTools** - State management debugging

## 🐛 Debugging Setup

### Console Logging
```typescript
// Use structured logging
import { logger } from '@/lib/logger';

logger.info('User action', { userId, action: 'create_lead' });
logger.error('API error', { error, context: 'lead_submission' });
```

### React DevTools
- Install React Developer Tools browser extension
- Use component inspector for props and state
- Profile component renders for performance optimization

### Supabase Debugging
```typescript
// Enable SQL logging in development
const supabase = createClient(url, key, {
  auth: { debug: true },
  db: { schema: 'public' }
});
```

### Network Debugging
- Use browser Network tab for API calls
- Check Supabase dashboard for database logs
- Monitor real-time subscriptions in browser console

## 📊 Performance Monitoring

### Bundle Analysis
```bash
# Analyze bundle size
npm run analyze

# Check for unused dependencies
npm run check-unused

# Audit dependencies for vulnerabilities
npm audit
```

### Performance Profiling
```typescript
// Profile React components
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log('Component render time:', { id, phase, actualDuration });
}

<Profiler id="Dashboard" onRender={onRenderCallback}>
  <Dashboard />
</Profiler>
```

## 🔧 Troubleshooting

### Common Issues

#### Supabase Connection Issues
```bash
# Check Supabase status
npx supabase status

# Restart local instance
npx supabase stop
npx supabase start
```

#### Type Errors
```bash
# Regenerate types from database
npm run generate-types

# Clear TypeScript cache
rm -rf node_modules/.cache
npm run type-check
```

#### Build Failures
```bash
# Clear all caches
npm run clean
rm -rf node_modules
npm install

# Check for circular dependencies
npm run check-circular
```

### Getting Help

1. **Check documentation** in `/docs` folder
2. **Search existing issues** in repository
3. **Check console logs** for error details
4. **Verify environment variables** are correct
5. **Ask team members** via Slack/Discord

## 🚀 Production Deployment

### Build Optimization
```bash
# Production build with optimizations
npm run build:production

# Check bundle size
npm run bundle-analyzer

# Run production preview
npm run preview:production
```

### Environment Setup
- Set production environment variables
- Configure Supabase production instance
- Set up monitoring and error tracking
- Configure CDN for static assets

### Deployment Checklist
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] Bundle size within limits
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security headers configured
- [ ] Performance monitoring enabled