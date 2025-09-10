# SmartStart Module

## Overview
SmartStart is an adaptive, search-based homepage component that provides personalized onboarding experiences for different user roles (guest, user, company, admin).

## Features
- **Role-Adaptive Content**: Different experience based on user authentication and role
- **Progressive Search Flow**: 3-step process (Search → Location → Contact)
- **Feature Flag Control**: Controlled by `ENABLE_SMART_START` feature flag
- **Lead Generation**: Integrates with existing lead system
- **Analytics Tracking**: Comprehensive event tracking for optimization
- **Accessibility**: WCAG 2.1 AA compliant

## Components

### SmartStart.tsx
Main container component that:
- Manages feature flag activation
- Handles role-based preloading
- Provides fallback to VisitorWizard when disabled

### SearchProgress.tsx
Progress indicator that:
- Shows current step (1-4) with visual indicators
- Displays estimated time remaining
- Provides step-by-step guidance

### RoleAdaptiveContent.tsx
Content renderer that:
- Shows different service categories for private vs business users
- Adapts search suggestions based on role
- Provides role-specific benefits and messaging

## Usage

```typescript
import { SmartStart } from '@/modules/smart-start';

// Basic usage (auto-detects role)
<SmartStart />

// With props
<SmartStart 
  className="custom-class"
  defaultRole="user"
  onComplete={(data) => console.log('Flow completed:', data)}
/>
```

## Feature Flag Integration

The module is controlled by the `ENABLE_SMART_START` feature flag:
- When enabled: Shows SmartStart experience
- When disabled: Falls back to existing VisitorWizard

## Analytics Events

The module tracks these events:
- `smart_start_search`: When user performs a search
- `smart_start_search_complete`: When search results are loaded
- `smart_start_step_complete`: When user completes a step
- `smart_start_reset`: When user resets the flow

## Role-Based Experiences

### Guest (Not Authenticated)
- Full 3-step search flow
- Service category selection
- Lead generation at completion

### User (Authenticated)
- Personalized dashboard shortcuts
- Quick access to previous searches
- Enhanced recommendations

### Company
- Business-focused service categories
- Lead intake dashboard
- Multi-user management features

### Admin
- System overview
- Analytics dashboard
- Module management

## Development

### Testing
```bash
# Unit tests
npm run test src/modules/smart-start

# E2E tests
npm run e2e:smart-start
```

### Module Integration
The module is registered in `moduleRegistry.ts` with:
- ID: `smart-start`
- Business Domain: `bytt`
- Dependencies: `['auth', 'leads']`
- Feature Flags: `['ENABLE_SMART_START']`