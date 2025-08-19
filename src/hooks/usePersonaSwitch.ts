import { useState, useCallback, useEffect } from 'react';
import { UserRole } from '@/modules/auth/utils/roles/types';
import { useAuth } from '@/modules/auth/hooks';

interface PersonaState {
  activePersona: UserRole | null;
  availablePersonas: UserRole[];
}

/**
 * Hook for managing persona switching between available roles
 * This will be expanded when role_grants system is fully implemented
 */
export function usePersonaSwitch() {
  const { role } = useAuth();
  const [personaState, setPersonaState] = useState<PersonaState>({
    activePersona: null,
    availablePersonas: [],
  });

  // Initialize with current role and determine available personas
  useEffect(() => {
    if (role) {
      const currentRole = role as UserRole;
      let availablePersonas: UserRole[] = [currentRole];
      
      // Add logic for determining available personas based on role grants
      // For now, admin users can switch to user mode and vice versa
      if (['admin', 'master_admin'].includes(currentRole)) {
        availablePersonas.push('user');
      }
      
      setPersonaState(prev => ({
        ...prev,
        activePersona: currentRole,
        availablePersonas,
      }));
    }
  }, [role]);

  const switchPersona = useCallback((newPersona: UserRole) => {
    // Store in localStorage for persistence
    localStorage.setItem('active_persona', newPersona);
    
    setPersonaState(prev => ({
      ...prev,
      activePersona: newPersona,
    }));
  }, []);

  const clearPersona = useCallback(() => {
    localStorage.removeItem('active_persona');
    setPersonaState(prev => ({
      ...prev,
      activePersona: null,
    }));
  }, []);

  const loadPersistedPersona = useCallback(() => {
    const stored = localStorage.getItem('active_persona');
    if (stored) {
      setPersonaState(prev => ({
        ...prev,
        activePersona: stored as UserRole,
      }));
    }
  }, []);

  return {
    activePersona: personaState.activePersona,
    availablePersonas: personaState.availablePersonas,
    switchPersona,
    clearPersona,
    loadPersistedPersona,
  };
}