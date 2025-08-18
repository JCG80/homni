import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { LandingPage } from './LandingPage';

const Index: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();

  // If authenticated and role is resolved, redirect to the appropriate dashboard
  if (isAuthenticated && role && !isLoading) {
    console.log('[Index] Redirecting authenticated user to dashboard:', { role });
    return <Navigate to={`/dashboard/${role}`} replace />;
  }

  // Otherwise, show the landing page (includes loading state handling)
  return <LandingPage />;
};

export default Index;
