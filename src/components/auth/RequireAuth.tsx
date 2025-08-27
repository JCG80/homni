import React from 'react';

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  // For now, just render children - auth logic can be added later
  return <>{children}</>;
}