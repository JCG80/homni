import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MobileOptimizedInput } from './MobileOptimizedInput';
import { SocialLoginButtons } from './SocialLoginButtons';
import { useEnhancedLogin } from '../../hooks/useEnhancedLogin';
import { motion } from 'framer-motion';
import { LogIn, Key, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EnhancedLoginFormProps {
  userType: 'private' | 'business';
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
}

export const EnhancedLoginForm = ({ 
  userType, 
  onSuccess, 
  redirectTo,
  className 
}: EnhancedLoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const { 
    isSubmitting, 
    error, 
    handleLogin,
    clearError 
  } = useEnhancedLogin({
    onSuccess,
    redirectTo
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin({ email, password, rememberMe });
  };

  const canSubmit = email.length > 0 && password.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("space-y-6", className)}
    >
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <LogIn className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2">
          {userType === 'business' ? 'Logg inn som bedrift' : 'Logg inn som privatperson'}
        </h2>
        <p className="text-muted-foreground">
          Velkommen tilbake til Homni
        </p>
      </div>

      {/* Social Login Options */}
      <SocialLoginButtons userType={userType} mode="login" />

      <div className="relative">
        <Separator />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-background px-3 text-sm text-muted-foreground">
            eller logg inn med e-post
          </span>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <MobileOptimizedInput
          label="E-postadresse"
          type="email"
          value={email}
          onChange={(value) => {
            setEmail(value);
            clearError();
          }}
          placeholder="din@epost.no"
          autoComplete="email"
          autoFocus
          required
        />

        <MobileOptimizedInput
          label="Passord"
          type="password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            clearError();
          }}
          placeholder="Ditt passord"
          autoComplete="current-password"
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-muted-foreground">Husk meg</span>
          </label>
          
          <Button
            type="button"
            variant="link"
            size="sm"
            className="text-primary hover:underline p-0 h-auto"
            onClick={() => {
              // TODO: Implement forgot password
              console.log('Forgot password clicked');
            }}
          >
            Glemt passord?
          </Button>
        </div>

        <Button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="w-full h-12 text-base"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
              Logger inn...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Logg inn
            </>
          )}
        </Button>
      </form>

      {/* Additional Options */}
      <Card className="bg-muted/30 border-primary/20">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Key className="h-5 w-5 text-primary mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium">Første gang hos oss?</p>
              <p className="text-muted-foreground">
                Opprett en konto for å få tilgang til alle våre tjenester og personlige anbefalinger.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};