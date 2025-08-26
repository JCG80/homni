
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { RegisterForm } from '@/modules/auth/components/RegisterForm';
import { EnhancedRegistrationWizard } from '@/modules/auth/components/enhanced/EnhancedRegistrationWizard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/modules/auth/hooks';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { GuestAccessCTA } from '@/components/cta/GuestAccessCTA';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const typeParam = searchParams.get('type');
  const [activeTab, setActiveTab] = useState<string>(typeParam === 'business' ? 'business' : 'private');
  const [useEnhancedFlow, setUseEnhancedFlow] = useState(true);

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


  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Laster inn...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <PageBreadcrumb 
          items={[{ label: 'Registrer deg' }]} 
          className="mb-8"
        />
        
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center">
              <Link to="/" className="inline-block mb-6">
                <span className="text-2xl font-bold text-primary">Homni</span>
              </Link>
              
              <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="private">Privatperson</TabsTrigger>
                  <TabsTrigger value="business">Bedrift</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Enhanced Flow Toggle (Development) */}
              {import.meta.env.MODE === 'development' && (
                <div className="flex items-center justify-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
                  <Label htmlFor="enhanced-flow" className="text-sm">
                    Bruk forbedret registreringsflow
                  </Label>
                  <Switch
                    id="enhanced-flow"
                    checked={useEnhancedFlow}
                    onCheckedChange={setUseEnhancedFlow}
                  />
                </div>
              )}
            </div>
        
            {/* Registration Forms */}
            <div className="bg-card rounded-lg shadow-sm border p-6">
              {useEnhancedFlow ? (
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                  <TabsContent value="private" className="mt-0">
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold mb-2">Registrer deg som privatperson</h1>
                      <p className="text-muted-foreground">
                        Vi guider deg gjennom registreringen steg for steg
                      </p>
                    </div>
                    
                    <EnhancedRegistrationWizard 
                      userType="private" 
                      redirectTo="/dashboard"
                    />
                  </TabsContent>
                  
                  <TabsContent value="business" className="mt-0">
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold mb-2">Registrer bedrift</h1>
                      <p className="text-muted-foreground">
                        Vi guider deg gjennom registreringen steg for steg
                      </p>
                    </div>
                    
                    <EnhancedRegistrationWizard 
                      userType="business" 
                      redirectTo="/dashboard/company"
                    />
                  </TabsContent>
                </Tabs>
              ) : (
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                  <TabsContent value="private" className="mt-0">
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold mb-2">Registrer deg som privatperson</h1>
                      <p className="text-muted-foreground">
                        Opprett en konto for å få tilgang til alle våre tjenester
                      </p>
                    </div>
                    
                    <RegisterForm redirectTo="/dashboard" userType="private" showTabs={false} />
                  </TabsContent>
                  
                  <TabsContent value="business" className="mt-0">
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold mb-2">Registrer bedrift</h1>
                      <p className="text-muted-foreground">
                        Opprett en bedriftskonto hos Homni
                      </p>
                    </div>
                    
                    <RegisterForm redirectTo="/dashboard" userType="business" showTabs={false} />
                  </TabsContent>
                </Tabs>
              )}
            </div>

            {/* Guest Access CTA */}
            <GuestAccessCTA />
            
            {/* Links */}
            <div className="text-center text-sm space-y-2">
              <p className="text-muted-foreground">
                Har du allerede en konto?{' '}
                <Link 
                  to={activeTab === 'business' ? '/login?type=business' : '/login'} 
                  className="text-primary hover:underline font-medium"
                >
                  Logg inn
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
