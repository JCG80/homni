
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { RegisterForm } from '@/modules/auth/components/RegisterForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/modules/auth/hooks';
import { Button } from '@/components/ui/button';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const typeParam = searchParams.get('type');
  const [activeTab, setActiveTab] = useState<string>(typeParam === 'business' ? 'business' : 'private');

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user && !isLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (typeParam === 'business') {
      setActiveTab('business');
    } else {
      setActiveTab('private');
    }
  }, [typeParam]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/register${value === 'business' ? '?type=business' : ''}`, { replace: true });
  };

  const handleTryOnboardingWizard = () => {
    navigate('/onboarding');
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Laster inn...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <Link to="/" className="inline-block mb-6 text-2xl font-bold text-primary">Homni</Link>
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 bg-white">
              <TabsTrigger value="private">Privatperson</TabsTrigger>
              <TabsTrigger value="business">Bedrift</TabsTrigger>
            </TabsList>
            
            <TabsContent value="private" className="mt-6">
              <h1 className="text-3xl font-bold">Registrer deg som privatperson</h1>
              <p className="text-muted-foreground mt-2">
                Opprett en konto for å få tilgang til alle våre tjenester
              </p>
              
              <RegisterForm redirectTo="/dashboard" userType="private" showTabs={false} />
            </TabsContent>
            
            <TabsContent value="business" className="mt-6">
              <h1 className="text-3xl font-bold">Registrer bedrift</h1>
              <p className="text-muted-foreground mt-2">
                Opprett en bedriftskonto hos Homni
              </p>
              
              <RegisterForm redirectTo="/dashboard" userType="business" showTabs={false} />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="text-center">
          <Button variant="link" onClick={handleTryOnboardingWizard}>
            Try our new guided onboarding wizard
          </Button>
        </div>
        
        <div className="text-center text-sm">
          <p className="text-muted-foreground mb-2">
            Har du allerede en konto?{' '}
            <Link to={activeTab === 'business' ? '/login?type=business' : '/login'} className="text-primary hover:underline">
              Logg inn
            </Link>
          </p>
          <Link to="/" className="hover:text-primary text-muted-foreground">
            ← Tilbake til forsiden
          </Link>
        </div>
      </div>
    </div>
  );
};
