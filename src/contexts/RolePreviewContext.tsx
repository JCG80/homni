import React, { createContext, useContext, useState, useCallback } from 'react';
import { UserRole } from '@/modules/auth/normalizeRole';

interface RolePreviewContextType {
  previewRole: UserRole | null;
  setPreviewRole: (role: UserRole | null) => void;
  isPreviewMode: boolean;
  canUsePreview: boolean;
}

const RolePreviewContext = createContext<RolePreviewContextType | null>(null);

export const RolePreviewProvider: React.FC<React.PropsWithChildren<{
  canUsePreview: boolean;
}>> = ({ children, canUsePreview }) => {
  const [previewRole, setPreviewRoleState] = useState<UserRole | null>(() => {
    if (typeof window !== 'undefined' && canUsePreview) {
      const stored = localStorage.getItem('role_preview');
      return stored ? (stored as UserRole) : null;
    }
    return null;
  });

  const setPreviewRole = useCallback((role: UserRole | null) => {
    if (!canUsePreview) return;
    
    setPreviewRoleState(role);
    if (typeof window !== 'undefined') {
      if (role) {
        localStorage.setItem('role_preview', role);
      } else {
        localStorage.removeItem('role_preview');
      }
    }
  }, [canUsePreview]);

  const value: RolePreviewContextType = {
    previewRole: canUsePreview ? previewRole : null,
    setPreviewRole,
    isPreviewMode: canUsePreview && previewRole !== null,
    canUsePreview
  };

  return (
    <RolePreviewContext.Provider value={value}>
      {children}
    </RolePreviewContext.Provider>
  );
};

export const useRolePreview = () => {
  const context = useContext(RolePreviewContext);
  if (!context) {
    throw new Error('useRolePreview must be used within RolePreviewProvider');
  }
  return context;
};