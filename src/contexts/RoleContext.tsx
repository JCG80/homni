import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks';

type Mode = 'personal' | 'professional';

interface RoleCtx {
  roles: string[];
  activeMode: Mode;
  setActiveMode: (m: Mode) => Promise<void>;
  isSwitching: boolean;
  isLoading: boolean;
  error: string | null;
}

const Ctx = createContext<RoleCtx | null>(null);

export const RoleProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);
  const [activeMode, setActiveModeState] = useState<Mode>('personal');
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { 
      setRoles([]); 
      setActiveModeState('personal'); 
      setIsLoading(false); 
      return; 
    }
    
    // Get user data from profile metadata instead of auth metadata
    const getUserData = async () => {
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('metadata, role')
          .eq('user_id', user.id)
          .single();
          
        if (profile?.metadata) {
          const meta = profile.metadata as any; // Cast to any for safe access
          const allowed = (meta?.allowed_modes as string[]) || ['personal'];
          const userRoles = (meta?.roles as string[]) || [profile.role || 'user'];
          
          setRoles(userRoles);
          setActiveModeState((meta?.active_mode as Mode) || 'personal');
        } else {
          // Fallback for users without metadata
          setRoles([profile?.role || 'user']);
          setActiveModeState('personal');
        }
      } catch (error) {
        console.error('Error loading user roles:', error);
        setRoles(['user']);
        setActiveModeState('personal');
      }
      setIsLoading(false);
    };
    
    getUserData();
  }, [user]);

  const setActiveMode = useCallback(async (m: Mode) => {
    if (!user) return;
    if (activeMode === m) return;
    
    setIsSwitching(true);
    setError(null);
    const prev = activeMode;
    setActiveModeState(m); // Optimistic update
    
    try {
      const { error: fnErr } = await supabase.functions.invoke('switch-role', { 
        body: { new_mode: m } 
      });
      if (fnErr) throw fnErr;
      
      await supabase.auth.refreshSession();
    } catch (e: any) {
      setActiveModeState(prev); // Rollback
      setError(e?.message || 'Kunne ikke bytte modus');
    } finally {
      setIsSwitching(false);
    }
  }, [supabase, user, activeMode]);

  const value = useMemo<RoleCtx>(() => ({ 
    roles, 
    activeMode, 
    setActiveMode, 
    isSwitching, 
    isLoading, 
    error 
  }), [roles, activeMode, setActiveMode, isSwitching, isLoading, error]);
  
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useRoleContext = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useRoleContext must be used within RoleProvider');
  return ctx;
};