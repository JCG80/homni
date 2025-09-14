/**
 * Test factories for creating mock user data
 * Provides consistent test data generation for authentication flows
 */

import { faker } from '@faker-js/faker';
import { vi } from 'vitest';

export interface MockUser {
  id: string;
  email: string;
  password: string;
  display_name?: string;
  role: 'user' | 'company' | 'admin' | 'content_editor' | 'master_admin';
  account_type: 'private' | 'business';
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MockCompany {
  id: string;
  name: string;
  org_number: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface MockUserProfile {
  id: string;
  user_id: string;
  display_name: string;
  role: MockUser['role'];
  account_type: MockUser['account_type'];
  company_id?: string;
  notification_preferences: Record<string, boolean>;
  ui_preferences: Record<string, any>;
  feature_overrides: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

/**
 * Create a mock user for testing
 */
export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => {
  const now = new Date().toISOString();
  
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    password: 'TestPassword123!',
    display_name: faker.person.fullName(),
    role: 'user',
    account_type: 'private',
    created_at: now,
    updated_at: now,
    ...overrides
  };
};

/**
 * Create a mock company for testing
 */
export const createMockCompany = (overrides: Partial<MockCompany> = {}): MockCompany => {
  const now = new Date().toISOString();
  
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    org_number: faker.string.numeric(9),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    created_at: now,
    updated_at: now,
    ...overrides
  };
};

/**
 * Create a mock user profile for testing
 */
export const createMockUserProfile = (
  overrides: Partial<MockUserProfile> = {}
): MockUserProfile => {
  const now = new Date().toISOString();
  
  return {
    id: faker.string.uuid(),
    user_id: faker.string.uuid(),
    display_name: faker.person.fullName(),
    role: 'user',
    account_type: 'private',
    notification_preferences: {
      email_notifications: true,
      push_notifications: false,
      marketing_emails: false
    },
    ui_preferences: {
      theme: 'system',
      language: 'no',
      sidebar_collapsed: false
    },
    feature_overrides: {},
    created_at: now,
    updated_at: now,
    ...overrides
  };
};

/**
 * Create a business user with associated company
 */
export const createMockBusinessUser = (
  userOverrides: Partial<MockUser> = {},
  companyOverrides: Partial<MockCompany> = {}
): { user: MockUser; company: MockCompany; profile: MockUserProfile } => {
  const company = createMockCompany(companyOverrides);
  
  const user = createMockUser({
    account_type: 'business',
    role: 'company',
    company_id: company.id,
    ...userOverrides
  });
  
  const profile = createMockUserProfile({
    user_id: user.id,
    display_name: user.display_name,
    role: user.role,
    account_type: user.account_type,
    company_id: user.company_id
  });
  
  return { user, company, profile };
};

/**
 * Create multiple test users with different roles
 */
export const createMockUserSet = (): {
  privateUser: MockUser;
  businessUser: MockUser;
  adminUser: MockUser;
  company: MockCompany;
  profiles: MockUserProfile[];
} => {
  const company = createMockCompany();
  
  const privateUser = createMockUser({
    account_type: 'private',
    role: 'user'
  });
  
  const businessUser = createMockUser({
    account_type: 'business',
    role: 'company',
    company_id: company.id
  });
  
  const adminUser = createMockUser({
    account_type: 'business',
    role: 'admin',
    company_id: company.id
  });
  
  const profiles = [
    createMockUserProfile({
      user_id: privateUser.id,
      display_name: privateUser.display_name,
      role: privateUser.role,
      account_type: privateUser.account_type
    }),
    createMockUserProfile({
      user_id: businessUser.id,
      display_name: businessUser.display_name,
      role: businessUser.role,
      account_type: businessUser.account_type,
      company_id: businessUser.company_id
    }),
    createMockUserProfile({
      user_id: adminUser.id,
      display_name: adminUser.display_name,
      role: adminUser.role,
      account_type: adminUser.account_type,
      company_id: adminUser.company_id
    })
  ];
  
  return {
    privateUser,
    businessUser,
    adminUser,
    company,
    profiles
  };
};

/**
 * Authentication test scenarios
 */
export const authTestScenarios = {
  validLogin: {
    email: 'test.user@example.com',
    password: 'ValidPassword123!'
  },
  
  invalidLogin: {
    email: 'invalid@example.com',
    password: 'wrongpassword'
  },
  
  newUserRegistration: {
    email: 'newuser@example.com',
    password: 'NewPassword123!',
    display_name: 'New Test User'
  },
  
  businessRegistration: {
    email: 'business@example.com',
    password: 'BusinessPass123!',
    display_name: 'Business Owner',
    company_name: 'Test Company AS',
    org_number: '123456789'
  }
};

/**
 * Mock auth context for testing components that use useAuth
 */
export interface MockAuthContext {
  user?: any;
  profile?: any;
  isAuthenticated?: boolean;
  isLoading?: boolean;
  login?: () => void;
  logout?: () => void;
  register?: () => void;
}

/**
 * Create a mock auth context for testing
 */
export const createMockAuthContext = (overrides: Partial<MockAuthContext> = {}): MockAuthContext => {
  const defaultUser = {
    id: faker.string.uuid(),
    email: 'test@example.com'
  };

  const defaultProfile = {
    id: faker.string.uuid(),
    full_name: faker.person.fullName(),
    role: 'user',
    email: 'test@example.com',
    phone: faker.phone.number()
  };

  return {
    user: defaultUser,
    profile: defaultProfile,
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    ...overrides
  };
};