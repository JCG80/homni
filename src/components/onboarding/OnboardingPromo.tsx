
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const OnboardingPromo = () => {
  const navigate = useNavigate();
  
  const handleStartOnboarding = () => {
    navigate('/onboarding');
  };
  
  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 shadow-sm">
      <h3 className="font-bold text-lg mb-2">New to Homni?</h3>
      <p className="text-muted-foreground mb-4">
        Try our new guided onboarding process to get started quickly!
      </p>
      <Button onClick={handleStartOnboarding} className="gap-2">
        Start Onboarding
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
