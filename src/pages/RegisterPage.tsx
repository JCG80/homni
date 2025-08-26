
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
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Building2, Shield, Zap } from 'lucide-react';

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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <PageBreadcrumb 
            items={[
              { label: 'Tjenester', href: '/select-services' },
              { label: 'Registrer deg' }
            ]} 
          />
          <Button 
            variant="ghost" 
            size="sm" 
            asChild
          >
            <Link to="/select-services">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tilbake til tjenester
            </Link>
          </Button>
        </div>
        
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <div className="w-full max-w-2xl space-y-8">
            {/* Header with Value Proposition */}
            <div className="text-center space-y-6">
              <Link to="/" className="inline-block">
                <span className="text-3xl font-bold text-primary">Homni</span>
              </Link>
              
              <div className="space-y-4">
                <h1 className="text-3xl font-bold">Opprett din konto</h1>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  Få personaliserte tilbud, sammenlign priser og administrer alle dine tjenester på ett sted.
                </p>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
                <div className="flex flex-col items-center text-center p-4">
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold text-sm">Sikker og trygg</h3>
                  <p className="text-xs text-muted-foreground">Dine data er beskyttet</p>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <Zap className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold text-sm">Rask sammenligning</h3>
                  <p className="text-xs text-muted-foreground">Få tilbud på sekunder</p>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold text-sm">Personlig service</h3>
                  <p className="text-xs text-muted-foreground">Skreddersytt for deg</p>
                </div>
              </div>

              {/* User Type Selection */}
              <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                  <TabsTrigger value="private" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Privatperson
                  </TabsTrigger>
                  <TabsTrigger value="business" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Bedrift
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
        
            {/* Registration Forms */}
            <div className="bg-card rounded-lg shadow-sm border p-6">
              {useEnhancedFlow ? (
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                  <TabsContent value="private" className="mt-0">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-semibold mb-2">Registrer deg som privatperson</h2>
                      <p className="text-muted-foreground text-sm">
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
                      <h2 className="text-xl font-semibold mb-2">Registrer bedrift</h2>
                      <p className="text-muted-foreground text-sm">
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
                      <h2 className="text-xl font-semibold mb-2">Registrer deg som privatperson</h2>
                      <p className="text-muted-foreground text-sm">
                        Opprett en konto for å få tilgang til alle våre tjenester
                      </p>
                    </div>
                    
                    <RegisterForm redirectTo="/dashboard" userType="private" showTabs={false} />
                  </TabsContent>
                  
                  <TabsContent value="business" className="mt-0">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-semibold mb-2">Registrer bedrift</h2>
                      <p className="text-muted-foreground text-sm">
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

            {/* Development Toggle - Less Prominent */}
            {import.meta.env.MODE === 'development' && (
              <div className="flex items-center justify-center gap-2 pt-4 border-t border-border/50">
                <Label htmlFor="enhanced-flow" className="text-xs text-muted-foreground">
                  Dev: Forbedret flow
                </Label>
                <Switch
                  id="enhanced-flow"
                  checked={useEnhancedFlow}
                  onCheckedChange={setUseEnhancedFlow}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
