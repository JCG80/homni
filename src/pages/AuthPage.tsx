import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LoginForm } from '@/modules/auth/components/LoginForm';
import { RegisterForm } from '@/modules/auth/components/RegisterForm';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, UserCircle, Building } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks';

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Get params from URL
  const mode = searchParams.get('mode') || 'login'; // 'login' or 'register'
  const userType = searchParams.get('type') === 'business' ? 'business' : 'private';
  const returnUrl = searchParams.get('returnUrl');

  // Redirect authenticated users automatically
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(returnUrl || '/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, returnUrl]);

  const [activeTab, setActiveTab] = useState(mode);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL params when tab changes
    const newParams = new URLSearchParams(searchParams);
    newParams.set('mode', value);
    navigate(`/auth?${newParams.toString()}`, { replace: true });
  };

  const handleSuccess = () => {
    navigate(returnUrl || '/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6">
        <Helmet>
          <title>{activeTab === 'register' ? 'Registrer deg' : 'Logg inn'} – Homni</title>
          <meta 
            name="description" 
            content={activeTab === 'register' 
              ? 'Opprett en ny konto hos Homni for å få tilgang til alle funksjoner.'
              : 'Logg inn for å få tilgang til dashbord, moduler og administrasjon.'
            } 
          />
          <meta name="robots" content="noindex,nofollow" />
        </Helmet>
        
        {/* Back button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Tilbake til forsiden
          </Button>
        </div>

        {/* Header with user type indicator */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {userType === 'business' ? (
              <Building className="h-8 w-8 text-primary" />
            ) : (
              <UserCircle className="h-8 w-8 text-primary" />
            )}
          </div>
          <h1 className="text-3xl font-bold">
            {activeTab === 'register' ? 'Registrer deg' : 'Logg inn'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {userType === 'business' ? 'Bedriftskonto' : 'Privatperson'}
          </p>
        </div>
        
        {/* Auth forms with tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Logg inn</TabsTrigger>
            <TabsTrigger value="register">Registrer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-6">
            <LoginForm 
              userType={userType}
              redirectTo={returnUrl || '/dashboard'}
              onSuccess={handleSuccess}
            />
          </TabsContent>
          
          <TabsContent value="register" className="mt-6">
            <RegisterForm 
              userType={userType}
              redirectTo={returnUrl || '/dashboard'}
              onSuccess={handleSuccess}
              showTabs={false}
            />
          </TabsContent>
        </Tabs>

        {/* Development info */}
        {import.meta.env.MODE === 'development' && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <p><strong>Utviklingsmodus:</strong></p>
            <p>Mode: {activeTab}</p>
            <p>Type: {userType}</p>
            <p>Return URL: {returnUrl || 'none'}</p>
            <p className="mt-2 text-xs">
              Tip: Disable "Confirm email" i Supabase Authentication settings for raskere testing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};