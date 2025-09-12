import { UserRole } from './roles/types';
import { logger } from '@/utils/logger';

// Define a type for dev user profile
export interface DevUserProfile {
  id: string;
  name: string;
  role: UserRole;
  initials: string;
  // Add any other properties needed for development testing
  email?: string;
  company_id?: string;
  metadata?: Record<string, any>;
}

// Function to extract dev users from environment variables
export const getDevUsers = (): Record<string, DevUserProfile> => {
  // Only process in development mode
  if (import.meta.env.MODE !== 'development') {
    return {};
  }

  const devUsers: Record<string, DevUserProfile> = {};

  // Iterate through all environment variables
  Object.keys(import.meta.env).forEach((key) => {
    if (key.startsWith('VITE_DEV_USER_')) {
      try {
        // Extract the key without the prefix
        const userKey = key.replace('VITE_DEV_USER_', '').toLowerCase();
        // Parse the JSON value
        const userProfile = JSON.parse(import.meta.env[key]);
        devUsers[userKey] = userProfile;
      } catch (error) {
        logger.error('Error parsing dev user', { key, error });
      }
    }
  });

  return devUsers;
};

// Get all development users
export const DEV_USERS = getDevUsers();

// Get current user key from URL or localStorage
export const getCurrentDevUserKey = (): string | null => {
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  // Check URL for dev parameter
  const urlParams = new URLSearchParams(window.location.search);
  const devKey = urlParams.get('dev');

  // If dev key is in URL and valid, use it
  if (devKey && DEV_USERS[devKey]) {
    return devKey;
  }

  // Otherwise, check localStorage
  const savedKey = localStorage.getItem('devUser');
  if (savedKey && DEV_USERS[savedKey]) {
    return savedKey;
  }

  // If no valid key found, return first key or null
  const keys = Object.keys(DEV_USERS);
  return keys.length > 0 ? keys[0] : null;
};

// Get current dev user profile
export const getCurrentDevUserProfile = (): DevUserProfile | null => {
  const key = getCurrentDevUserKey();
  return key ? DEV_USERS[key] : null;
};

// Switch to a different dev user
export const switchDevUser = (key: string): DevUserProfile | null => {
  if (import.meta.env.MODE !== 'development' || !DEV_USERS[key]) {
    return null;
  }

  // Save to localStorage
  localStorage.setItem('devUser', key);

  // Update URL without reload
  const url = new URL(window.location.href);
  url.searchParams.set('dev', key);
  window.history.replaceState({}, '', url);

  return DEV_USERS[key];
};
