
import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { LoginTabs } from '@/components/auth/LoginTabs';
import { BreadcrumbNavigation } from '@/components/navigation/BreadcrumbNavigation';
import { GuestAccessCTA } from '@/components/cta/GuestAccessCTA';
import { UnifiedQuickLogin } from '@/modules/auth/components/UnifiedQuickLogin';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading, isAuthenticated, role } = useAuth();
  
  // Get type parameter for initial tab selection
  const userType = searchParams.get('type') || 'private';
  
  // Get return URL from query parameters if available
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated && role && !isLoading) {
      // Get role-based redirect path
      const getRoleBasedPath = (userRole: string) => {
        switch (userRole) {
          case 'master_admin':
          case 'admin':
            return '/admin';
          case 'company':
            return '/dashboard/company';
          case 'content_editor':
            return '/dashboard/content-editor';
          case 'user':
            return '/dashboard/user';
          default:
            return '/dashboard';
        }
      };
      
      // Use returnUrl if provided and valid, otherwise use role-based dashboard
      if (returnUrl && returnUrl !== '/login' && returnUrl !== '/' && !returnUrl.includes('login')) {
        navigate(returnUrl, { replace: true });
      } else {
        const targetPath = getRoleBasedPath(role);
        navigate(targetPath, { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, role, navigate, returnUrl]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg mt-4">Verifiserer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <BreadcrumbNavigation 
          customItems={[
            { label: 'Forside', href: '/', isActive: false },
            { label: 'Logg inn', href: '', isActive: true }
          ]}
          showOnMobile
        />
        
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center">
              <Link to="/" className="inline-block mb-6">
                <span className="text-2xl font-bold text-primary">Homni</span>
              </Link>
              <h1 className="text-3xl font-bold mb-2">Velkommen tilbake</h1>
              <p className="text-muted-foreground">
                Logg inn for å få tilgang til alle våre tjenester
              </p>
            </div>
        
            {/* Login Form */}
            <div className="bg-card rounded-lg shadow-sm border p-6">
              <LoginTabs defaultTab={userType === 'business' ? 'business' : 'private'} />
              
              {import.meta.env.MODE === 'development' && (
                <div className="border-t pt-4 mt-4">
                  <p className="text-xs text-muted-foreground mb-4">Utviklerverktøy</p>
                  <UnifiedQuickLogin redirectTo={returnUrl} />
                </div>
              )}
            </div>

            {/* Guest Access CTA */}
            <GuestAccessCTA />
            
            {/* Links */}
            <div className="text-center text-sm space-y-2">
              <p className="text-muted-foreground">
                Har du ikke konto?{' '}
                <Link 
                  to={`/register${userType === 'business' ? '?type=business' : ''}`} 
                  className="text-primary hover:underline font-medium"
                >
                  Registrer deg her
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
