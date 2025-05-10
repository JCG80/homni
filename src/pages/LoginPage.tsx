
import React, { useEffect, useState } from 'react';
import { LoginForm } from '@/modules/auth/components/LoginForm';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { devLogin } from '@/modules/auth/utils/devLogin';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const typeParam = searchParams.get('type');
  const [activeTab, setActiveTab] = useState<string>(typeParam === 'business' ? 'business' : 'private');

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

  const handleDevLogin = async (role: 'user' | 'company' | 'admin' | 'master-admin') => {
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
          <div className="mt-8 text-center space-x-2">
            <button 
              onClick={() => handleDevLogin('user')} 
              className="px-3 py-1 bg-gray-200 rounded text-xs"
            >
              Login as User
            </button>
            <button 
              onClick={() => handleDevLogin('company')} 
              className="px-3 py-1 bg-gray-200 rounded text-xs"
            >
              Login as Company
            </button>
            <button 
              onClick={() => handleDevLogin('admin')} 
              className="px-3 py-1 bg-gray-200 rounded text-xs"
            >
              Login as Admin
            </button>
            <button 
              onClick={() => handleDevLogin('master-admin')} 
              className="px-3 py-1 bg-gray-200 rounded text-xs"
            >
              Login as Master Admin
            </button>
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
