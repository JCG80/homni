import { useState, useCallback } from 'react';
import { UserRole } from '@/modules/auth/utils/roles/types';

interface PersonaState {
  activePersona: UserRole | null;
  availablePersonas: UserRole[];
}

/**
 * Hook for managing persona switching between available roles
 * This will be expanded when role_grants system is fully implemented
 */
export function usePersonaSwitch() {
  const [personaState, setPersonaState] = useState<PersonaState>({
    activePersona: null,
    availablePersonas: [],
  });

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