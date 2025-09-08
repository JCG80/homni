/**
 * Dashboard Module Types
 * Defines the structure for dashboard components and data
 */

import { ReactNode } from 'react';
import { UserRole } from '@/modules/auth/utils/roles/types';

/**
 * Base metric interface for dashboard cards
 */
export interface Metric {
  label: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
    period: string;
  };
  format?: 'number' | 'currency' | 'percentage' | 'bytes';
}

/**
 * Time range options for dashboard data
 */
export type TimeRange = '1h' | '24h' | '7d' | '30d' | '90d' | 'all';

/**
 * Dashboard card props interface
 */
export interface DashboardCardProps {
  title: ReactNode;
  children?: ReactNode;
  className?: string;
  isLoading?: boolean;
  error?: Error | null;
  empty?: boolean;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  actions?: ReactNode;
  metric?: Metric;
}

/**
 * Dashboard widget configuration
 */
export interface WidgetConfig {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<any>;
  roles: UserRole[];
  order: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  refreshInterval?: number; // in seconds
  dependencies?: string[]; // other widget IDs this depends on
}

/**
 * Dashboard layout configuration
 */
export interface DashboardConfig {
  title: string;
  description?: string;
  role: UserRole;
  widgets: WidgetConfig[];
  layout?: 'grid' | 'masonry' | 'list';
  columns?: 1 | 2 | 3 | 4;
}

/**
 * Filter configuration for dashboard data
 */
export interface DashboardFilter {
  timeRange?: TimeRange;
  search?: string;
  category?: string;
  status?: string;
  [key: string]: any;
}

/**
 * Dashboard query result interface
 */
export interface DashboardQueryResult<T = any> {
  data: T;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  lastUpdated?: Date;
}

/**
 * Action item for dashboard cards
 */
export interface DashboardAction {
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<any>;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
  loading?: boolean;
}