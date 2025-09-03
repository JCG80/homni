import React from 'react';
import { ProfileContextContext, useProfileContextLogic } from '@/hooks/useProfileContext';

interface ProfileContextProviderProps {
  children: React.ReactNode;
}

export function ProfileContextProvider({ children }: ProfileContextProviderProps) {
  const profileContextValue = useProfileContextLogic();

  return (
    <ProfileContextContext.Provider value={profileContextValue}>
      {children}
    </ProfileContextContext.Provider>
  );
}