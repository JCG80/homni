import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { HomePage } from './HomePage';
import { routeForRole } from '@/config/routeForRole';
import { UserRole } from '@/modules/auth/normalizeRole';
import { logger } from '@/utils/logger';

const Index: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();

  // If authenticated and role is resolved, redirect to the appropriate dashboard
  if (isAuthenticated && role && !isLoading) {
    logger.debug('Redirecting authenticated user to dashboard', { role, userId: 'redacted' });
    return <Navigate to={routeForRole(role as UserRole)} replace />;
  }

  // Otherwise, show the home page (includes loading state handling)
  return <HomePage />;
};

export default Index;
