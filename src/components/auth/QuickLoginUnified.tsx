
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, User, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface QuickLoginUnifiedProps {
  onLoginSuccess?: () => void;
  showHeader?: boolean;
  defaultTab?: 'private' | 'business';
}

export const QuickLoginUnified = ({ 
  onLoginSuccess, 
  showHeader = true,
  defaultTab = 'private'
}: QuickLoginUnifiedProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  
  const [activeTab, setActiveTab] = useState<'private' | 'business'>(
    typeParam === 'business' ? 'business' : defaultTab
  );

  const handleQuickLogin = (userType: 'private' | 'business') => {
    // Navigate to login page with the selected type
    const loginPath = userType === 'business' ? '/login?type=business' : '/login';
    navigate(loginPath);
  };

  const handleQuickRegister = (userType: 'private' | 'business') => {
    // Navigate to register page with the selected type
    const registerPath = userType === 'business' ? '/register?type=business' : '/register';
    navigate(registerPath);
  };

  const handleOnboardingFlow = () => {
    navigate('/onboarding');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {showHeader && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Kom i gang med Homni</h2>
          <p className="text-muted-foreground">Velg hvordan du vil bruke tjenesten</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'private' | 'business')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="private" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Privatperson
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Bedrift
          </TabsTrigger>
        </TabsList>

        <TabsContent value="private" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Privatperson
              </CardTitle>
              <CardDescription>
                Få tilgang til sammenligning av strøm, forsikring og andre tjenester
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => handleQuickLogin('private')} 
                className="w-full"
                variant="default"
              >
                Logg inn som privatperson
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                onClick={() => handleQuickRegister('private')} 
                className="w-full"
                variant="outline"
              >
                Registrer deg som privatperson
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Bedrift
              </CardTitle>
              <CardDescription>
                Motta leads, administrer kunder og voks virksomheten din
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => handleQuickLogin('business')} 
                className="w-full"
                variant="default"
              >
                Logg inn som bedrift
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                onClick={() => handleQuickRegister('business')} 
                className="w-full"
                variant="outline"
              >
                Registrer bedrift
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 text-center">
        <Button variant="ghost" onClick={handleOnboardingFlow} className="text-sm">
          Prøv vår guidede oppsettsveiviser
        </Button>
      </div>
    </div>
  );
};
