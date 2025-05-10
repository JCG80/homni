
import { UserRole } from "@/modules/auth/types/types";

export interface MockUser {
  email: string;
  role: UserRole;
  name: string;
  id?: string;
}

/**
 * Mock users for testing purposes
 */
export const mockUsers: MockUser[] = [
  { 
    email: 'user@test.local', 
    role: 'member', // Changed from 'user' to 'member'
    name: 'Test User'
  },
  { 
    email: 'company@test.local', 
    role: 'company',
    name: 'Test Company'
  },
  { 
    email: 'admin@test.local', 
    role: 'admin',
    name: 'Test Admin'
  },
  { 
    email: 'master-admin@test.local', 
    role: 'master_admin', // Changed from 'master-admin' to 'master_admin'
    name: 'Test Master Admin'
  },
  { 
    email: 'provider@test.local', 
    role: 'provider',
    name: 'Test Provider'
  }
];

/**
 * Get mock user by role
 */
export const getUserByRole = (role: UserRole): MockUser | undefined => {
  return mockUsers.find(user => user.role === role);
};

/**
 * Get mock user by email
 */
export const getUserByEmail = (email: string): MockUser | undefined => {
  return mockUsers.find(user => user.email === email);
};
