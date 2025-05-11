
import React, { useEffect, useState } from 'react';
import { LoginForm } from '@/modules/auth/components/LoginForm';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { devLogin, TEST_USERS } from '@/modules/auth/utils/devLogin';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRole } from '@/modules/auth/types/types';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const typeParam = searchParams.get('type');
  const [activeTab, setActiveTab] = useState<string>(typeParam === 'business' ? 'business' : 'private');
  const { user, isLoading } = useAuth();

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
    navigate(`/login${value === 'business' ? '?type=business' : ''}`, { replace: true });
  };

  const handleDevLogin = async (role: UserRole) => {
    console.log(`Attempting dev login as ${role}`);
    const result = await devLogin(role);
    if (result.error) {
      toast({
        title: 'Innlogging feilet',
        description: result.error.message,
        variant: 'destructive',
      });
    }
    // Suksess-meldinger håndteres allerede i devLogin
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
              <h1 className="text-3xl font-bold">Logg inn som privatperson</h1>
              <p className="text-muted-foreground mt-2">
                Velkommen tilbake til Homni
              </p>
              
              <LoginForm redirectTo="/dashboard" userType="private" />
            </TabsContent>
            
            <TabsContent value="business" className="mt-6">
              <h1 className="text-3xl font-bold">Logg inn som bedrift</h1>
              <p className="text-muted-foreground mt-2">
                Logg inn på din bedriftskonto hos Homni
              </p>
              
              <LoginForm redirectTo="/dashboard" userType="business" />
            </TabsContent>
          </Tabs>
        </div>
        
        {import.meta.env.MODE === 'development' && (
          <div className="mt-8">
            <p className="text-sm text-center mb-4">Testbrukere for utvikling</p>
            <div className="space-y-2">
              {TEST_USERS.map((user) => (
                <Button 
                  key={user.email}
                  onClick={() => handleDevLogin(user.role)}
                  className="w-full text-xs"
                  variant="outline"
                  size="sm"
                >
                  Logg inn som {user.name} ({user.role})
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-center text-sm">
          <p className="text-muted-foreground mb-2">
            Har du ikke konto?{' '}
            <Link to={activeTab === 'business' ? '/register?type=business' : '/register'} className="text-primary hover:underline">
              Registrer deg
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
