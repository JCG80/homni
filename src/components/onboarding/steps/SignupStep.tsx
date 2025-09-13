import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, ChevronRight, Loader2, Mail, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';

interface SignupStepProps {
  formData: {
    email: string;
    password: string;
    fullName: string;
  };
  onFormChange: (field: string, value: string) => void;
  onNext: () => void;
}

export const SignupStep: React.FC<SignupStepProps> = ({
  formData,
  onFormChange,
  onNext,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'E-post er påkrevd';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ugyldig e-postadresse';
    }

    if (!formData.password) {
      newErrors.password = 'Passord er påkrevd';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Passord må være minst 6 tegn';
    }

    if (!formData.fullName) {
      newErrors.fullName = 'Fullt navn er påkrevd';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.fullName,
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user && !data.session) {
        // Email confirmation required
        toast({
          title: "Bekreft e-posten din",
          description: "Vi har sendt en bekreftelseslink til e-posten din. Sjekk innboksen og følg instruksjonene.",
          variant: "default"
        });
      }

      // Move to next step regardless of email confirmation
      onNext();

    } catch (error: any) {
      logger.error('Signup failed', {
        module: 'SignupStep',
        email: formData.email
      }, error);

      let errorMessage = 'Noe gikk galt under registreringen';
      
      if (error.message?.includes('already registered')) {
        errorMessage = 'E-postadressen er allerede registrert';
      } else if (error.message?.includes('invalid email')) {
        errorMessage = 'Ugyldig e-postadresse';
      } else if (error.message?.includes('weak password')) {
        errorMessage = 'Passordet er for svakt';
      }

      toast({
        title: "Registrering mislyktes",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Opprett din konto</h2>
        <p className="text-muted-foreground">
          Kom i gang med Homni på få minutter
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kontoopplysninger</CardTitle>
          <CardDescription>
            Fyll inn informasjonen din for å opprette konto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fullName">
              Fullt navn <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Ola Nordmann"
              value={formData.fullName}
              onChange={(e) => onFormChange('fullName', e.target.value)}
              className={`mt-1 ${errors.fullName ? 'border-destructive' : ''}`}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">
              E-postadresse <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="ola@example.com"
                value={formData.email}
                onChange={(e) => onFormChange('email', e.target.value)}
                className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">
              Passord <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minst 6 tegn"
                value={formData.password}
                onChange={(e) => onFormChange('password', e.target.value)}
                className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive mt-1">{errors.password}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Passordet ditt bør være minst 6 tegn langt
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Privacy */}
      <div className="text-xs text-muted-foreground text-center">
        Ved å opprette konto godtar du våre{' '}
        <a href="/terms" className="text-primary hover:underline">
          vilkår for bruk
        </a>{' '}
        og{' '}
        <a href="/privacy" className="text-primary hover:underline">
          personvernpolicy
        </a>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 min-w-[120px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Oppretter...
            </>
          ) : (
            <>
              Fortsett
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};