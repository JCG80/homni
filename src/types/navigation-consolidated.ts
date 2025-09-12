/**
 * Consolidated navigation types for better consistency
 * Single source of truth for all navigation-related interfaces
 */

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { UserRole } from '@/modules/auth/normalizeRole';

/**
 * Core navigation item interface
 */
export interface NavigationItem {
  id?: string;
  href: string;
  title: string;
  icon?: LucideIcon | ReactNode;
  label?: string;
  description?: string;
  children?: NavigationItem[];
  moduleKey?: string;
  featureFlag?: string;
  requiredRole?: string | string[];
  disabled?: boolean;
  badge?: string | number;
  external?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

/**
 * Enhanced navigation item with additional properties
 */
export interface EnhancedNavigationItem extends NavigationItem {
  weight?: number;
  category?: string;
  tags?: string[];
  lastAccessed?: Date;
  accessCount?: number;
  metadata?: Record<string, any>;
}

/**
 * Navigation section grouping
 */
export interface NavigationSection {
  id: string;
  title: string;
  icon?: LucideIcon;
  items: NavigationItem[];
  collapsed?: boolean;
  order?: number;
}

/**
 * Navigation configuration for different contexts
 */
export interface NavigationConfig {
  primary: NavigationItem[];
  secondary?: NavigationItem[];
  quickActions?: NavigationItem[];
  mobile?: NavigationItem[];
  breadcrumbs?: NavigationItem[];
}

/**
 * Unified navigation configuration
 */
export interface UnifiedNavConfig {
  primary: NavigationItem[];
  secondary: NavigationItem[];
  quickActions: NavigationItem[];
  mobile: NavigationItem[];
}

/**
 * Navigation preferences for users
 */
export interface NavigationPreferences {
  favoriteItems: string[];
  hiddenItems: string[];
  customOrder?: string[];
  viewMode: 'compact' | 'expanded' | 'icons-only';
  showLabels: boolean;
  showIcons: boolean;
  enableAnimations: boolean;
  compactMode?: boolean;
  sidebarCollapsed?: boolean;
}

/**
 * Quick action navigation item
 */
export interface QuickAction extends NavigationItem {
  shortcut?: string;
  group?: string;
  priority?: number;
}

/**
 * Navigation suggestion for smart navigation
 */
export interface NavigationSuggestion {
  id: string;
  title: string;
  href: string;
  type: 'contextual' | 'quick' | 'recent' | 'frequent';
  icon?: LucideIcon;
  description?: string;
  score: number;
  context?: string;
  reasons?: string[];
}

/**
 * Contextual navigation state
 */
export interface ContextualNavigationState {
  currentPath: string;
  breadcrumbs: NavigationItem[];
  suggestions: NavigationSuggestion[];
  quickActions: QuickAction[];
  recentItems: NavigationItem[];
}

/**
 * Mobile navigation specific properties
 */
export interface MobileNavigationProps {
  items: NavigationItem[];
  isOpen: boolean;
  onClose: () => void;
  showLabels?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Role-based navigation properties
 */
export interface RoleBasedNavigationProps {
  userRole: string;
  enabledModules: string[];
  featureFlags: Record<string, boolean>;
  customization?: NavigationPreferences;
}

/**
 * Navigation cache interface
 */
export interface NavigationCache {
  items: NavigationItem[];
  timestamp: number;
  version: string;
  userRole?: string;
}

/**
 * Smart navigation hook return type
 */
export interface SmartNavigationHook {
  suggestions: NavigationSuggestion[];
  recentItems: NavigationItem[];
  favoriteItems: NavigationItem[];
  loading: boolean;
  refreshSuggestions: () => void;
}

/**
 * Navigation consolidation report
 */
export interface NavigationConsolidationReport {
  totalItems: number;
  duplicateItems: NavigationItem[];
  orphanedItems: NavigationItem[];
  recommendations: string[];
  consolidatedStructure: NavigationConfig;
}

/**
 * Step navigation for multi-step processes
 */
export interface StepNavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
  onNext?: () => void;
  onCancel?: () => void;
  disablePrevious?: boolean;
  disableNext?: boolean;
  nextLabel?: string;
  previousLabel?: string;
  showStepNumbers?: boolean;
}

/**
 * Insurance-specific navigation
 */
export interface InsuranceStepNavigationProps {
  currentStep: number;
  steps: Array<{
    id: string;
    title: string;
    completed?: boolean;
  }>;
  onStepClick?: (step: number) => void;
}

/**
 * Authenticated navigation properties
 */
export interface AuthenticatedNavigationProps {
  className?: string;
  role?: UserRole;
  isAuthenticated: boolean;
}