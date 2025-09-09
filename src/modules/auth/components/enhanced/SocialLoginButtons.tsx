import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Chrome, Apple, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface SocialLoginButtonsProps {
  userType: 'private' | 'business';
  mode?: 'login' | 'register';
}

export const SocialLoginButtons = ({ 
  userType, 
  mode = 'register' 
}: SocialLoginButtonsProps) => {
  const handleGoogleAuth = async () => {
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google auth error:', error);
      toast({
        title: "Autentiseringsfeil",
        description: "Kunne ikke logge inn med Google. Prøv igjen.",
        variant: "destructive",
      });
    }
  };

  const handleAppleAuth = async () => {
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Apple auth error:', error);
      toast({
        title: "Autentiseringsfeil", 
        description: "Apple Sign-In er ikke tilgjengelig for øyeblikket.",
        variant: "destructive",
      });
    }
  };

  const handleMagicLink = async () => {
    // This would trigger a magic link flow
    toast({
      title: "Magic Link",
      description: "Magic Link pålogging kommer snart!",
    });
  };

  const actionText = mode === 'login' ? 'Logg inn' : 'Registrer';

  return (
    <div className="space-y-4">
      <div className="relative">
        <Separator />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-background px-3 text-sm text-muted-foreground">
            eller {actionText.toLowerCase()} med
          </span>
        </div>
      </div>

      <div className="grid gap-3">
        <Button
          variant="outline"
          onClick={handleGoogleAuth}
          className="h-11 w-full"
          type="button"
        >
          <Chrome className="mr-3 h-4 w-4" />
          {actionText} med Google
        </Button>

        {/* Apple Sign-In is commonly expected on mobile */}
        <Button
          variant="outline"
          onClick={handleAppleAuth}
          className="h-11 w-full"
          type="button"
        >
          <Apple className="mr-3 h-4 w-4" />
          {actionText} med Apple
        </Button>

        {/* Magic Link for passwordless experience */}
        <Button
          variant="outline"
          onClick={handleMagicLink}
          className="h-11 w-full"
          type="button"
        >
          <Mail className="mr-3 h-4 w-4" />
          Send magisk lenke
        </Button>
      </div>

      {userType === 'business' && (
        <div className="text-xs text-muted-foreground text-center">
          <p>
            Bedriftskontoer kan også bruke Microsoft eller andre enterprise-løsninger
          </p>
        </div>
      )}
    </div>
  );
};