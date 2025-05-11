
import React, { useEffect, useState } from 'react';
import { LoginForm } from '@/modules/auth/components/LoginForm';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { devLogin, TEST_USERS, verifyTestUsers } from '@/modules/auth/utils/devLogin';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRole } from '@/modules/auth/types/types';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import { AlertCircle, Info, Loader2 } from 'lucide-react';

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const typeParam = searchParams.get('type');
  const [activeTab, setActiveTab] = useState<string>(typeParam === 'business' ? 'business' : 'private');
  const { user, isLoading } = useAuth();
  const [missingUsers, setMissingUsers] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

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
  
  // Verify test users on component mount in development mode
  useEffect(() => {
    const checkTestUsers = async () => {
      if (import.meta.env.MODE === 'development') {
        setIsVerifying(true);
        try {
          const missing = await verifyTestUsers();
          setMissingUsers(missing);
        } catch (err) {
          console.error('Error verifying test users:', err);
        } finally {
          setIsVerifying(false);
        }
      }
    };
    
    checkTestUsers();
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/login${value === 'business' ? '?type=business' : ''}`, { replace: true });
  };

  const handleDevLogin = async (role: UserRole) => {
    console.log(`Attempting dev login as ${role}`);
    const user = TEST_USERS.find(u => u.role === role);
    
    if (!user) return;
    
    if (user && missingUsers.includes(user.email)) {
      toast({
        title: 'Test user not created',
        description: `The ${role} test user doesn't exist in the database`,
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setLoadingRole(role);
      const result = await devLogin(role);
      
      if (result.error) {
        toast({
          title: 'Innlogging feilet',
          description: result.error.message,
          variant: 'destructive',
        });
      }
      // Suksess-meldinger håndteres allerede i devLogin
    } catch (err) {
      toast({
        title: 'Feil ved innlogging',
        description: err instanceof Error ? err.message : 'Ukjent feil oppstod',
        variant: 'destructive',
      });
    } finally {
      setLoadingRole(null);
    }
  };

  const runSetupTestUsers = async () => {
    try {
      // @ts-ignore - This is defined in setupTestUsers.ts
      if (window.setupTestUsers) {
        toast({
          title: 'Oppretter testbrukere',
          description: 'Lager testbrukere i databasen...',
        });
        // @ts-ignore
        await window.setupTestUsers();
        setIsVerifying(true);
        const missing = await verifyTestUsers();
        setMissingUsers(missing);
        setIsVerifying(false);
        
        if (missing.length === 0) {
          toast({
            title: 'Vellykket',
            description: 'Alle testbrukere ble opprettet',
          });
        } else {
          toast({
            title: 'Delvis vellykket',
            description: `${missing.length} testbrukere kunne ikke opprettes`,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Setup-funksjon ikke funnet',
          description: 'setupTestUsers-funksjonen er ikke tilgjengelig',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Feil ved oppretting av testbrukere',
        description: error.message || 'En ukjent feil oppstod',
        variant: 'destructive',
      });
    }
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
          
          {import.meta.env.MODE === 'development' && missingUsers.length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Test users missing</AlertTitle>
              <AlertDescription className="text-xs">
                Some test users are not set up in the database.
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={runSetupTestUsers}
                  className="mt-2 w-full"
                >
                  Setup Test Users
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
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
                  variant={missingUsers.includes(user.email) ? "destructive" : "outline"}
                  size="sm"
                  disabled={isVerifying || loadingRole === user.role}
                >
                  {loadingRole === user.role ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Logger inn...
                    </>
                  ) : missingUsers.includes(user.email) ? (
                    <>
                      <AlertCircle className="mr-2 h-3 w-3" />
                      {user.name} ({user.role}) - Ikke opprettet
                    </>
                  ) : (
                    <>
                      {user.name} ({user.role})
                    </>
                  )}
                </Button>
              ))}
            </div>
            
            {import.meta.env.MODE === 'development' && (
              <div className="mt-4 text-xs text-center">
                <details>
                  <summary className="cursor-pointer text-muted-foreground">Dev setup instructions</summary>
                  <div className="mt-2 p-3 bg-muted rounded-md text-left">
                    <p className="font-medium">To create test users:</p>
                    <ol className="list-decimal pl-4 mt-1 space-y-1">
                      <li>Use the "Setup Test Users" button above</li>
                      <li>Or run <code>window.setupTestUsers()</code> in browser console</li>
                    </ol>
                    <p className="mt-2 font-medium">If login fails after setup:</p>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      <li>Check if "Confirm Email" is disabled in Supabase Auth settings</li>
                      <li>Verify Site URL and Redirect URLs in Supabase Auth settings</li>
                    </ul>
                  </div>
                </details>
              </div>
            )}
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
