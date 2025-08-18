import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

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
  const supabase = useSupabaseClient();
  const user = useUser();
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
    
    const meta: any = user.app_metadata || {};
    const allowed = (meta.allowed_modes as string[]) || ['personal'];
    setRoles([...(meta.roles || []), ...(allowed.includes('professional') ? ['company'] : [])]);
    setActiveModeState((meta.active_mode as Mode) || 'personal');
    setIsLoading(false);
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