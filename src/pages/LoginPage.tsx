
import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks';
import { LoginTabs } from '@/components/auth/LoginTabs';
import { toast } from '@/hooks/use-toast';
import { useRoleNavigation } from '@/modules/auth/hooks/roles/useRoleNavigation';
import { Globe, Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { UnifiedQuickLogin } from '@/modules/auth/components/UnifiedQuickLogin';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading, isAuthenticated, role } = useAuth();
  const { redirectToDashboard } = useRoleNavigation({ autoRedirect: false });
  
  // Get type parameter for initial tab selection
  const userType = searchParams.get('type') || 'private';
  
  // Get return URL from query parameters if available
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  
  // Log authentication state for debugging
  useEffect(() => {
    console.log("LoginPage - Authentication state:", { 
      isAuthenticated, 
      role, 
      returnUrl,
      userType
    });
  }, [isAuthenticated, role, returnUrl, userType]);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated && role && !isLoading) {
      console.log(`LoginPage - User already authenticated, redirecting...`);
      
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
        console.log(`LoginPage - Redirecting ${role} to: ${targetPath}`);
        navigate(targetPath, { replace: true });
      }
    }
  }, [user, isLoading, isAuthenticated, role, navigate, returnUrl]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse"></div>
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
          <p className="text-lg mt-4">Verifiserer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          className="flex items-center justify-center min-h-[calc(100vh-4rem)]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="w-full max-w-md space-y-6">
            <motion.div className="text-center" variants={itemVariants}>
              <Link to="/" className="inline-block mb-8">
                <div className="flex items-center justify-center">
                  <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
                    <ShieldCheck className="h-7 w-7 text-white" />
                  </div>
                  <span className="ml-2 text-2xl font-bold text-primary">Homni</span>
                </div>
              </Link>
              <h1 className="text-2xl font-bold mb-2">Velkommen tilbake</h1>
              <p className="text-muted-foreground">Logg inn for å fortsette</p>
            </motion.div>
        
            <motion.div variants={itemVariants} className="bg-card rounded-lg shadow-sm border p-6">
              <LoginTabs defaultTab={userType === 'business' ? 'business' : 'private'} />
              
              {import.meta.env.MODE === 'development' && (
                <motion.div variants={itemVariants} className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-muted-foreground">Utviklerverktøy</p>
                  </div>
                  <UnifiedQuickLogin redirectTo={returnUrl} />
                </motion.div>
              )}
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-center text-sm space-y-3">
              <p className="text-muted-foreground">
                Har du ikke konto?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Registrer deg her
                </Link>
              </p>
              <Link to="/" className="text-primary hover:underline inline-flex items-center font-medium">
                ← Tilbake til forsiden
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
