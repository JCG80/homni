
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { useAuth } from '@/modules/auth/hooks';

export const OnboardingPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // If user is already authenticated, redirect them to dashboard
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome to Homni</h1>
          <p className="text-muted-foreground">Complete the following steps to get started</p>
        </div>
        <OnboardingWizard />
      </div>
    </div>
  );
};
