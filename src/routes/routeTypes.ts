import { ReactNode } from 'react';

export type UserRole = 'anonymous' | 'user' | 'company' | 'content_editor' | 'admin' | 'master_admin';

export type AppRoute = {
  path: string;
  element: ReactNode;
  index?: boolean;
  children?: AppRoute[];
  // governance
  roles?: UserRole[];
  flag?: string; // feature flag key
  navKey?: string; // optional: ties to nav/menu
};