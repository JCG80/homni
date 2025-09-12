import { ReactNode } from 'react';
import { UserRole } from '@/modules/auth/normalizeRole';

export type { UserRole }; // Re-export for compatibility

export type AppRoute = {
  path: string;
  element: ReactNode;
  index?: boolean;
  children?: AppRoute[];
  // governance
  roles?: UserRole[];
  flag?: string; // feature flag key
  navKey?: string; // optional: ties to nav/menu
  // availability
  alwaysAvailable?: boolean; // never filtered by flags/roles
};