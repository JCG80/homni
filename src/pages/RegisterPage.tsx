
import React, { useEffect, useState } from 'react';
import { RegisterForm } from '@/modules/auth/components/RegisterForm';
import { Link, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  const [activeTab, setActiveTab] = useState<string>(typeParam === 'business' ? 'business' : 'private');

  useEffect(() => {
    if (typeParam === 'business') {
      setActiveTab('business');
    } else {
      setActiveTab('private');
    }
  }, [typeParam]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <Link to="/" className="inline-block mb-6 text-2xl font-bold text-primary">Homni</Link>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="private">Privatperson</TabsTrigger>
              <TabsTrigger value="business">Bedrift</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <h1 className="text-3xl font-bold">Registrer deg</h1>
          <p className="text-muted-foreground mt-2">
            {activeTab === 'business' 
              ? 'Opprett en bedriftskonto hos Homni' 
              : 'Opprett en konto for å få tilgang til alle våre tjenester'}
          </p>
        </div>
        
        <RegisterForm redirectTo="/dashboard" userType={activeTab === 'business' ? 'business' : 'private'} />
        
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
