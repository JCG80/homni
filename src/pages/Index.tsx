import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { LandingPage } from './LandingPage';

const Index: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  // If authenticated, redirect to the appropriate dashboard
  if (isAuthenticated && role) {
    return <Navigate to={`/dashboard/${role}`} replace />;
  }

  // Otherwise, show the landing page
  return <LandingPage />;
};

export default Index;
