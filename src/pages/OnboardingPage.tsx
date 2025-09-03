
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { GuestAccessCTA } from '@/components/cta/GuestAccessCTA';
import { useAuth } from '@/modules/auth/hooks';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';

export const OnboardingPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isEnabled: onboardingEnabled } = useFeatureFlag('ENABLE_ONBOARDING_WIZARD');
  
  // Redirect authenticated users to dashboard 
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If onboarding is disabled, redirect to login
  if (!onboardingEnabled) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <PageBreadcrumb 
          items={[{ label: 'Kom i gang' }]} 
          className="mb-8"
        />
        
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Velkommen til Homni</h1>
            <p className="text-lg text-muted-foreground">
              Fullfør disse trinnene for å komme i gang med din konto
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <OnboardingWizard />
            </div>
            
            <div className="space-y-6">
              <GuestAccessCTA 
                title="Eller start som gjest"
                description="Prøv våre tjenester uten å opprette konto først."
                buttonText="Utforsk tjenester"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
