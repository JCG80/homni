/**
 * Constants for Cypress tests
 * Part of Hybrid Testability & QA Pass v3.1
 */

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/dashboard/admin',
  ADMIN_LEADS: '/dashboard/admin/leads',
  USER_DASHBOARD: '/dashboard/user',
  COMPANY_DASHBOARD: '/dashboard/company',
} as const;

// Pipeline stages (slugs)
export const PIPELINE_STAGES = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress', 
  WON: 'won',
  LOST: 'lost',
} as const;

// Pipeline stage emojis (matching UI)
export const STAGE_EMOJIS = {
  [PIPELINE_STAGES.NEW]: '✨',
  [PIPELINE_STAGES.IN_PROGRESS]: '🚀',
  [PIPELINE_STAGES.WON]: '🏆',
  [PIPELINE_STAGES.LOST]: '❌',
} as const;

// User roles
export const USER_ROLES = {
  GUEST: 'guest',
  USER: 'user', 
  COMPANY: 'company',
  CONTENT_EDITOR: 'content_editor',
  ADMIN: 'admin',
  MASTER_ADMIN: 'master_admin',
} as const;

// Test data prefixes (for cleanup)
export const TEST_PREFIXES = {
  LEAD: 'E2E Test Lead',
  COMPANY: 'E2E Test Company',
  USER: 'E2E Test User',
} as const;