
import { useEffect, useState } from 'react';
import {
  getCurrentDevUserKey,
  getCurrentDevUserProfile,
  DevUserProfile,
  switchDevUser
} from '../utils/devProfiles';
import { UserRole } from '../utils/roles/types';

/**
 * This hook is only for development purposes.
 * It provides an easy way to switch between different user profiles during development.
 * In production, this hook will not have any effect.
 */
export const useDevAuth = () => {
  const [devUserKey, setDevUserKey] = useState<string | null>(null);
  const [devProfile, setDevProfile] = useState<DevUserProfile | null>(null);

  // Convert dev profile to auth user and profile
  const toAuthUser = (profile: DevUserProfile | null) => {
    if (!profile) return null;
    return {
      id: profile.id,
      email: profile.email || `${profile.id}@example.com`,
      role: profile.role as UserRole
    };
  };

  const toProfile = (profile: DevUserProfile | null) => {
    if (!profile) return null;
    return {
      id: profile.id,
      full_name: profile.name,
      role: profile.role as UserRole,
      company_id: profile.company_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: profile.metadata || {},
      email: profile.email || `${profile.id}@example.com`,
    };
  };

  // Initialize dev user from URL or localStorage
  useEffect(() => {
    if (import.meta.env.MODE === 'development') {
      const key = getCurrentDevUserKey();
      setDevUserKey(key);
      setDevProfile(getCurrentDevUserProfile());
    }
  }, []);

  // Function to switch to a different dev user
  const switchToDevUser = (key: string) => {
    if (import.meta.env.MODE !== 'development') return;
    
    const profile = switchDevUser(key);
    if (profile) {
      setDevUserKey(key);
      setDevProfile(profile);
    }
  };

  return {
    // Only use in development
    isDevMode: import.meta.env.MODE === 'development',
    devUserKey,
    devProfile,
    devUser: toAuthUser(devProfile),
    devUserProfile: toProfile(devProfile),
    switchToDevUser,
  };
};
