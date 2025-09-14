# Homni Platform - Final Architecture Documentation

## Overview
Homni is a modular, role-based platform combining lead-generation, home documentation, and DIY home-selling functionality. This document outlines the final consolidated architecture.

## Core Architecture Principles

### 1. Modular Design
- **Plugin-driven architecture** with separate modules for different functionality
- **Clean separation of concerns** between authentication, routing, and business logic
- **Consistent API patterns** across all modules

### 2. Authentication-First
- **Role-based access control** (RBAC) with granular permissions
- **Multi-tenant support** for both private users and business accounts
- **Secure by default** with RLS policies and proper validation

### 3. Performance & Reliability
- **Error boundaries** at route and component levels
- **Graceful degradation** when services are unavailable
- **Enhanced loading states** and user feedback
- **Development tools** for debugging and monitoring

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** with custom design system
- **React Router** with hash routing for preview environments
- **React Query** for state management and caching
- **Framer Motion** for animations

### Backend
- **Supabase** for authentication, database, and storage
- **PostgreSQL** with Row Level Security (RLS)
- **Edge Functions** for serverless logic

### Development & Testing
- **Vitest** for unit and integration testing
- **Playwright** for E2E testing
- **ESLint & Prettier** for code quality
- **TypeScript** for type safety

## Directory Structure

```
src/
├── app/                    # Application providers and configuration
├── components/             # Shared UI components
│   ├── ui/                # shadcn/ui components
│   ├── error/             # Error boundary components
│   └── routing/           # Routing components
├── hooks/                 # Shared hooks
├── lib/                   # Utility libraries
├── modules/               # Feature modules
│   └── auth/              # Authentication module
│       ├── components/    # Auth-specific components
│       ├── hooks/         # Auth-specific hooks
│       ├── context/       # Auth context provider
│       └── __tests__/     # Auth tests
├── pages/                 # Page components
├── services/              # Business logic services
├── utils/                 # Utility functions
├── test/                  # Test utilities and factories
└── integrations/          # External service integrations
    └── supabase/          # Supabase configuration
```

## Key Features

### 1. Enhanced Environment Validation
- **Startup validation** with detailed feedback
- **Graceful degradation** for missing configurations
- **Development mode helpers** for debugging

### 2. Route Error Boundaries
- **Component-level error handling** with recovery options
- **Detailed error logging** in development mode
- **User-friendly error messages** with action buttons

### 3. Advanced Loading States
- **Multiple loading variants** (spinner, skeleton, dots, pulse)
- **Timeout detection** with fallback messages
- **Context-aware loading** for different UI areas

### 4. Development Tools
- **Global debug utilities** accessible via `window.__HOMNI_DEV__`
- **Performance monitoring** for long tasks and slow resources
- **Environment diagnostics** with validation and suggestions
- **Enhanced logging** with structured data and context

### 5. Comprehensive Testing
- **Unit tests** with high coverage requirements (90%+)
- **Integration tests** for authentication flows
- **E2E tests** for critical user journeys
- **Mock factories** for consistent test data

## Authentication System

### User Roles
- **Anonymous** - Unauthenticated users
- **User** - Authenticated private users
- **Company** - Business account users
- **Content Editor** - Content management permissions
- **Admin** - Administrative permissions
- **Master Admin** - Full system access

### Data Models

#### User Profiles
```sql
user_profiles (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  display_name text,
  role app_role,
  account_type account_type,
  company_id uuid,
  notification_preferences jsonb,
  ui_preferences jsonb,
  feature_overrides jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  deleted_at timestamptz
)
```

#### Company Profiles
```sql
company_profiles (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  org_number text UNIQUE,
  email text,
  phone text,
  address text,
  created_at timestamptz,
  updated_at timestamptz,
  deleted_at timestamptz
)
```

## Router Configuration

### Dynamic Router Selection
The platform automatically selects the appropriate router mode:
- **Hash Router** for Lovable preview environments
- **Browser Router** for production deployments
- **Environment detection** with automatic configuration

### Route Structure
```
/                          # Home page
/login                     # Authentication
/register                  # User registration
/dashboard                 # User dashboard
/admin/*                   # Admin routes (role-protected)
/unauthorized              # Access denied page
```

## Environment Management

### Configuration Validation
- **Supabase URL** and **API key** validation
- **Development mode** detection and warnings
- **Service status** monitoring and reporting
- **Graceful degradation** when services are unavailable

### Development Experience
- **Auto-configuration** for preview environments
- **Detailed logging** with context and structured data
- **Performance monitoring** with threshold alerts
- **Debug utilities** for troubleshooting

## Testing Strategy

### Unit Tests (90%+ Coverage)
- All hooks and utilities
- Component rendering and behavior
- Service layer logic
- Authentication flows

### Integration Tests (80%+ Coverage)
- API interactions
- Database operations
- Authentication journeys
- Error handling scenarios

### E2E Tests
- Complete user registration and login flows
- Role-based access control
- Critical business workflows
- Error recovery scenarios

## Performance Considerations

### Code Splitting
- **Route-level splitting** for optimal loading
- **Module lazy loading** when features are accessed
- **Component optimization** with React.memo where appropriate

### Caching Strategy
- **React Query** for API response caching
- **Service worker** for static asset caching (when applicable)
- **Local storage** for user preferences

### Monitoring
- **Performance observer** for long task detection
- **Resource loading** monitoring with alerts
- **Error boundary** reporting with context
- **Development metrics** for optimization guidance

## Security Measures

### Row Level Security (RLS)
- **User-scoped data access** with auth.uid() policies
- **Role-based permissions** for administrative functions
- **Company-scoped data** for business accounts

### Input Validation
- **Zod schemas** for all form inputs
- **Server-side validation** in Edge Functions
- **Type safety** throughout the application

### Authentication Security
- **Secure token handling** via Supabase
- **Session management** with automatic refresh
- **2FA support** for administrative accounts (future)

## Deployment & Operations

### CI/CD Pipeline
- **Automated testing** on all pull requests
- **Type checking** and linting validation
- **Security scanning** for dependencies
- **Performance budget** enforcement

### Monitoring & Observability
- **Error tracking** with contextual information
- **Performance metrics** collection
- **User analytics** for feature usage
- **Health checks** for critical services

## Future Roadmap

### Phase 2 Enhancements
- **Real estate listings** integration
- **Advanced search and filtering**
- **Document management** system
- **Payment processing** integration

### Technical Improvements
- **Progressive Web App** (PWA) features
- **Offline functionality** for core features
- **Advanced caching** strategies
- **Microservice architecture** for scalability

## Contributing Guidelines

### Code Standards
- **TypeScript** for all new code
- **Consistent naming** conventions
- **Comprehensive testing** for new features
- **Documentation** for public APIs

### Development Workflow
- **Feature branches** for all changes
- **Code reviews** required for all PRs
- **Automated testing** must pass
- **Performance impact** assessment

This architecture provides a solid foundation for the Homni platform with room for future growth and feature expansion while maintaining code quality, security, and performance standards.