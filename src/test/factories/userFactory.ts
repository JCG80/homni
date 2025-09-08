/**
 * Test data factories for consistent test data generation
 */

import { vi } from 'vitest';
import type { UserRole } from '@/modules/auth/normalizeRole';
import type { UserProfile, AuthUser } from '@/types/auth';

export const createMockUser = (overrides?: Partial<AuthUser>): AuthUser => ({
  id: 'test-user-id',
  email: 'test@example.com',
  ...overrides,
});

export const createMockProfile = (overrides?: Partial<UserProfile>): UserProfile => ({
  id: 'test-profile-id',
  full_name: 'Test User',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  metadata: {
    role: 'user',
    account_type: 'user',
    internal_admin: false,
  },
  preferences: {},
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
  profile: createMockProfile({ full_name: 'Admin User' }),
  role: 'admin' as UserRole,
});

export const createMasterAdminUser = () => ({
  user: createMockUser({ email: 'master@test.com' }),
  profile: createMockProfile({ full_name: 'Master Admin' }),
  role: 'master_admin' as UserRole,
});

export const createCompanyUser = () => ({
  user: createMockUser({ email: 'company@test.com' }),
  profile: createMockProfile({ full_name: 'Company User' }),
  role: 'company' as UserRole,
});