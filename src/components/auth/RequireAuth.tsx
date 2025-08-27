import React from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';

interface RequireAuthProps {
  children: React.ReactNode;
  roles?: string[];
  fallbackPath?: string;
}

export function RequireAuth({ children, roles, fallbackPath = '/login' }: RequireAuthProps) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && role && !roles.includes(role)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}