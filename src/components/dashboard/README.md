
# Dashboard System

This directory contains dashboard components and layouts for the application.

## Overview

The dashboard system consists of:

1. `DashboardLayout.tsx`: Base layout for dashboard pages
2. `DashboardWidget.tsx`: Reusable widget component for dashboard content
3. `RoleDashboard.tsx`: Role-specific dashboard wrapper that handles authorization

## Role-Based Dashboards

Role-specific dashboards are implemented under `/src/pages/dashboard/`:

- `/user`: For regular users
- `/company`: For business users
- `/content_editor`: For content management users
- `/admin`: For administrator users
- `/master_admin`: For super administrators

Each dashboard is tailored to the specific needs of that user role.

## RoleDashboard Component

The `RoleDashboard` component handles:

- Role-based access control
- Loading states
- Navigation integration
- Common layout elements

### Usage

```tsx
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';

const MyDashboardPage = () => {
  return (
    <RoleDashboard requiredRole="user" title="My Dashboard">
      {/* Dashboard content */}
    </RoleDashboard>
  );
};
```

### Props

- `requiredRole`: Single role or array of roles allowed to access this dashboard
- `title`: Dashboard title
- `children`: Dashboard content

## DashboardWidget

Used for creating consistent UI widgets across dashboards.

## Best Practices

- Keep dashboard pages clean and focused
- Use widgets to organize related content
- Consider performance implications of data fetching
- Implement proper loading states
- Test with different screen sizes for responsive behavior
