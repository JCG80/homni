
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { LoginForm } from '@/modules/auth/components/LoginForm';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const Unauthenticated = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Create a return URL to redirect back after login
  const returnUrl = location.pathname !== '/login' ? location.pathname : undefined;
  
  // Debug info
  console.log("Unauthenticated - Current path:", location.pathname, "Return URL:", returnUrl);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse"></div>
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
          <p className="text-lg mt-4">Verifiserer pålogging...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    console.log("Unauthenticated - User is authenticated, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container mx-auto p-8 min-h-screen flex flex-col justify-center">
      <motion.div 
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center mb-6">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Logg inn</h1>
        <p className="text-muted-foreground max-w-md mx-auto">Du må logge inn for å få tilgang til denne siden. Logg inn med din Homni-konto nedenfor.</p>
      </motion.div>
      
      <motion.div 
        className="max-w-md mx-auto bg-card p-8 rounded-lg shadow-lg border border-border/50"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <LoginForm redirectTo={returnUrl} />
      </motion.div>
    </div>
  );
};
