/**
 * Test data factories for consistent test data generation
 */

import { vi } from 'vitest';
import type { UserProfile, AuthUser, UserRole } from '@/types/auth';

export const createMockUser = (overrides?: Partial<AuthUser>): AuthUser => ({
  id: 'test-user-id',
  email: 'test@example.com',
  ...overrides,
});

export const createMockProfile = (overrides?: Partial<UserProfile>): UserProfile => ({
  id: 'test-profile-id',
  display_name: 'Test User',
  account_type: 'individual',
  company_id: null,
  notification_preferences: {},
  ui_preferences: {},
  feature_overrides: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
  ...overrides,
});

export const createMockCompanyProfile = (overrides?: Partial<any>) => ({
  id: 'test-company-id',
  company_name: 'Test Company AS',
  organization_number: '123456789',
  contact_person: 'Test Contact',
  email: 'company@test.com',
  phone: '+47 12345678',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockAuthContext = (overrides?: any) => ({
  user: createMockUser(),
  profile: createMockProfile(),
  role: 'user' as UserRole,
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn().mockResolvedValue({}),
  logout: vi.fn().mockResolvedValue({}),
  refreshAuth: vi.fn().mockResolvedValue({}),
  updateProfile: vi.fn().mockResolvedValue({}),
  ...overrides,
});

// Role-specific factories
export const createAdminUser = () => ({
  user: createMockUser({ email: 'admin@test.com' }),
  profile: createMockProfile({ display_name: 'Admin User' }),
  role: 'admin' as UserRole,
});

export const createMasterAdminUser = () => ({
  user: createMockUser({ email: 'master@test.com' }),
  profile: createMockProfile({ display_name: 'Master Admin' }),
  role: 'master_admin' as UserRole,
});

export const createCompanyUser = () => ({
  user: createMockUser({ email: 'company@test.com' }),
  profile: createMockProfile({ display_name: 'Company User' }),
  role: 'company' as UserRole,
});