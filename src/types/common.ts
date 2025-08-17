/**
 * Common utility types and shared interfaces
 */

/**
 * Base entity interface with common fields
 */
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Soft deletable entity interface
 */
export interface SoftDeletableEntity extends BaseEntity {
  deleted_at?: string | null;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Sort parameters
 */
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter parameters
 */
export interface FilterParams {
  [key: string]: any;
}

/**
 * Search parameters
 */
export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: FilterParams;
  sort?: SortParams;
}

/**
 * Generic list response
 */
export interface ListResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Feature flag interface
 */
export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  is_enabled: boolean;
  rollout_percentage?: number;
  target_roles?: string[];
  created_at: string;
  updated_at: string;
}

/**
 * System module interface
 */
export interface SystemModule {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  dependencies?: string[];
  route?: string;
  ui_component?: string;
  icon?: string;
  sort_order?: number;
  plugin_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Plugin manifest interface
 */
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  homepage?: string;
  repository?: string;
  entry_point: string;
  dependencies?: Record<string, any>;
  metadata?: Record<string, any>;
  is_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Content interface
 */
export interface Content {
  id: string;
  title: string;
  slug: string;
  body?: string;
  type: 'article' | 'news' | 'guide';
  published: boolean;
  published_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Property interface
 */
export interface Property {
  id: string;
  user_id: string;
  name: string;
  type: string;
  address?: string;
  size?: number;
  purchase_date?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Form validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Toast notification interface
 */
export interface ToastNotification {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

/**
 * Loading state interface
 */
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

/**
 * Generic form state interface
 */
export interface FormState<T = any> extends LoadingState {
  data: T;
  isDirty: boolean;
  isValid: boolean;
  errors: ValidationError[];
}