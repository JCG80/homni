
import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { LoginTabs } from '@/components/auth/LoginTabs';
import { UserRole } from '@/modules/auth/utils/roles';
import { toast } from '@/hooks/use-toast';
import { useRoleNavigation } from '@/modules/auth/hooks/roles/useRoleNavigation';
import { Globe, Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { QuickLoginEnhanced } from '@/modules/auth/components/QuickLoginEnhanced';

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
      console.log(`LoginPage - User already authenticated, redirecting to: ${returnUrl}`);
      
      // Use returnUrl if provided, otherwise use role-based dashboard
      if (returnUrl && returnUrl !== '/login' && returnUrl !== '/dashboard') {
        navigate(returnUrl, { replace: true });
      } else {
        redirectToDashboard();
      }
    }
  }, [user, isLoading, isAuthenticated, role, navigate, returnUrl, redirectToDashboard]);

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
    <div className="min-h-screen flex items-center justify-center bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/30 via-background to-background">
      <motion.div 
        className="w-full max-w-md p-8 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center" variants={itemVariants}>
          <Link to="/" className="inline-block mb-6">
            <div className="flex items-center justify-center">
              <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <span className="ml-2 text-2xl font-bold text-primary">Homni</span>
            </div>
          </Link>
          
          <motion.div className="flex justify-center mb-6 space-x-6" variants={itemVariants}>
            <div className="text-center">
              <div className="h-14 w-14 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Sikker innlogging</p>
            </div>
            
            <div className="text-center">
              <div className="h-14 w-14 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Tilgang overalt</p>
            </div>
            
            <div className="text-center">
              <div className="h-14 w-14 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Beskyttet</p>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-card rounded-lg shadow-lg border border-border/50 p-6">
          <LoginTabs defaultTab={userType === 'business' ? 'business' : 'private'} />
          
          {import.meta.env.MODE === 'development' && (
            <motion.div variants={itemVariants} className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground mb-2">Utviklerverktøy</p>
                <QuickLoginEnhanced onSuccess={() => redirectToDashboard()} />
              </div>
            </motion.div>
          )}
        </motion.div>
        
        <motion.div variants={itemVariants} className="text-center text-sm">
          <p className="text-muted-foreground mb-3">
            Har du ikke konto?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Registrer deg
            </Link>
          </p>
          <Link to="/" className="hover:text-primary text-muted-foreground inline-flex items-center hover:underline">
            <span>← Tilbake til forsiden</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};
