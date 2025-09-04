
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
    email: 'user@homni.no', 
    role: 'user',
    name: 'Test User'
  },
  { 
    email: 'company@homni.no', 
    role: 'company',
    name: 'Test Company'
  },
  { 
    email: 'admin@homni.no', 
    role: 'admin',
    name: 'Test Admin'
  },
  { 
    email: 'master@homni.no', 
    role: 'master_admin',
    name: 'Test Master Admin'
  },
  { 
    email: 'content@homni.no', 
    role: 'content_editor',
    name: 'Test Content Editor'
  },
  { 
    email: 'company@homni.no', 
    role: 'company',  // Changed from 'provider' to 'company'
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
