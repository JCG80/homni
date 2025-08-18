
import { UserRole } from '../../types/types';

export interface TestUser {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}

/**
 * Standard test users for each role in the system
 * These correspond to users that should exist in the Supabase database
 * for testing purposes
 */
export const TEST_USERS: TestUser[] = [
  { 
    email: 'user@test.local', 
    password: 'Test1234!', 
    role: 'user',
    name: 'Test User'
  },
  { 
    email: 'company@test.local', 
    password: 'Test1234!', 
    role: 'company',
    name: 'Test Company'
  },
  { 
    email: 'admin@test.local', 
    password: 'Test1234!', 
    role: 'admin',
    name: 'Test Admin'
  },
  { 
    email: 'master-admin@test.local', 
    password: 'Test1234!', 
    role: 'master_admin',
    name: 'Test Master Admin'
  },
  { 
    email: 'content@test.local', 
    password: 'Test1234!', 
    role: 'content_editor',
    name: 'Test Content Editor'
  },
  { 
    email: 'provider@test.local', 
    password: 'Test1234!', 
    role: 'company',  // Changed from 'provider' to 'company'
    name: 'Test Provider'
  }
];

/**
 * Get test user data by role
 */
export function getTestUserByRole(role: UserRole): TestUser | undefined {
  return TEST_USERS.find(user => user.role === role);
}

/**
 * Get test user data by email
 */
export function getTestUserByEmail(email: string): TestUser | undefined {
  return TEST_USERS.find(user => user.email === email);
}
