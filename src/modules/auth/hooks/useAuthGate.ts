/**
 * AuthGate hook - waits for auth+profile to be ready before redirecting
 * Part of the Ultimate Master 2.0 QuickLogin solution
 */
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { normalizeRole } from '@/modules/auth/normalizeRole';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { routeForRole } from '@/config/routeForRole';

interface UseAuthGateOptions {
  redirectOnReady?: boolean;
  waitForProfile?: boolean;
}

export function useAuthGate(opts: UseAuthGateOptions = {}) {
  const navigate = useNavigate();
  const { isAuthenticated, user, profile, isLoading } = useAuth();
  
  // Derive role from profile first, fallback to session metadata
  const derivedRole = useMemo(() => {
    const raw = profile?.role || 
                profile?.metadata?.role;
    return normalizeRole(raw);
  }, [profile?.role, profile?.metadata?.role]);

  // Determine if we're ready to proceed
  const ready = useMemo(() => {
    if (isLoading) return false;
    if (!isAuthenticated) return true; // Ready to show login
    
    if (opts.waitForProfile !== false) {
      // Wait for profile to be loaded AND role to be determined
      return !!profile && !!derivedRole && derivedRole !== 'anonymous';
    }
    
    // Just wait for auth to complete
    return true;
  }, [isLoading, isAuthenticated, profile, derivedRole, opts.waitForProfile]);

  // Auto-redirect when ready
  useEffect(() => {
    if (!opts.redirectOnReady || !ready) return;
    
    if (isAuthenticated && derivedRole) {
      const targetRoute = routeForRole(derivedRole);
      navigate(targetRoute, { replace: true });
    }
  }, [ready, isAuthenticated, derivedRole, navigate, opts.redirectOnReady]);

  return { 
    ready, 
    role: derivedRole,
    isAuthenticated,
    profile
  };
}