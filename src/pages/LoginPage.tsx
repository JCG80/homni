
import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { LoginTabs } from '@/components/auth/LoginTabs';
import { TestUserManager } from '@/components/auth/TestUserManager';
import { UserRole } from '@/modules/auth/utils/roles';
import { devLogin } from '@/modules/auth/utils/devLogin';
import { toast } from '@/hooks/use-toast';
import { useRoleNavigation } from '@/modules/auth/hooks/roles/useRoleNavigation';
import { Globe, Lock, ShieldCheck } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading, isAuthenticated, role } = useAuth();
  const { redirectToDashboard } = useRoleNavigation({ autoRedirect: false });
  
  // Get return URL from query parameters if available
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  
  // Log authentication state for debugging
  useEffect(() => {
    console.log("LoginPage - Authentication state:", { 
      isAuthenticated, 
      role, 
      returnUrl
    });
  }, [isAuthenticated, role, returnUrl]);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated && role && !isLoading) {
      console.log(`LoginPage - User already authenticated, redirecting to: ${returnUrl}`);
      
      // Use returnUrl if provided, otherwise use role-based dashboard
      if (returnUrl && returnUrl !== '/login' && returnUrl !== '/dashboard') {
        navigate(returnUrl, { replace: true });
      } else {
        redirectToDashboard();
      }
    }
  }, [user, isLoading, isAuthenticated, role, navigate, returnUrl, redirectToDashboard]);

  // Handle test user login
  const handleDevLogin = async (role: UserRole) => {
    try {
      const result = await devLogin(role);
      if (result.error) {
        toast({
          title: 'Innlogging feilet',
          description: result.error.message,
          variant: 'destructive',
        });
      } else {
        console.log(`LoginPage - Dev login successful for role: ${role}`);
        // Success notifications are already handled in devLogin
        redirectToDashboard();
      }
    } catch (error) {
      console.error("LoginPage - Dev login error:", error);
      toast({
        title: 'Innlogging feilet',
        description: 'En uventet feil oppstod ved innlogging',
        variant: 'destructive',
      });
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Laster inn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <Link to="/" className="inline-block mb-6">
            <div className="flex items-center justify-center">
              <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <span className="ml-2 text-2xl font-bold text-primary">Homni</span>
            </div>
          </Link>
          
          <div className="flex justify-center mb-6 space-x-4">
            <div className="text-center">
              <div className="h-12 w-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Sikker innlogging</p>
            </div>
            
            <div className="text-center">
              <div className="h-12 w-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Tilgang overalt</p>
            </div>
            
            <div className="text-center">
              <div className="h-12 w-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Beskyttet</p>
            </div>
          </div>
          
          <LoginTabs />
        </div>
        
        {import.meta.env.MODE === 'development' && (
          <div className="border-t pt-4 mt-4">
            <p className="text-xs text-muted-foreground mb-2 text-center">Utviklerverktøy</p>
            <TestUserManager onLoginClick={handleDevLogin} />
          </div>
        )}
        
        <div className="text-center text-sm border-t pt-4">
          <p className="text-muted-foreground mb-2">
            Har du ikke konto?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Registrer deg
            </Link>
          </p>
          <Link to="/" className="hover:text-primary text-muted-foreground inline-flex items-center">
            <span>← Tilbake til forsiden</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
