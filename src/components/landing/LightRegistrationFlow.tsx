import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { UserPlus, Mail, Lock } from 'lucide-react';

interface LightRegistrationFlowProps {
  email: string;
  role: 'private' | 'business';
  leadId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const LightRegistrationFlow = ({ 
  email, 
  role, 
  leadId, 
  onSuccess, 
  onCancel 
}: LightRegistrationFlowProps) => {
  const [step, setStep] = useState<'password' | 'otp'>('password');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordSignup = async () => {
    if (!password || password.length < 6) {
      toast.error('Passordet må være minst 6 tegn');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role === 'business' ? 'company' : 'user',
            lead_id: leadId,
            registration_source: 'visitor_wizard'
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: crypto.randomUUID(),
            user_id: data.user.id,
            full_name: email.split('@')[0],
            email: email,
            account_type: role === 'business' ? 'company' : 'user',
            role: role === 'business' ? 'company' : 'user',
            metadata: {
              registration_source: 'visitor_wizard',
              lead_id: leadId
            }
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        // Associate lead with user if leadId provided
        if (leadId) {
          await supabase
            .from('leads')
            .update({ submitted_by: data.user.id })
            .eq('id', leadId);
        }

        toast.success('Konto opprettet! Sjekk e-posten din for bekreftelse.');
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || 'Feil ved registrering');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPRequest = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: {
            role: role === 'business' ? 'company' : 'user',
            lead_id: leadId,
            registration_source: 'visitor_wizard'
          }
        }
      });

      if (error) throw error;

      setStep('otp');
      toast.success('OTP-kode sendt til din e-post!');
    } catch (error: any) {
      toast.error(error.message || 'Feil ved sending av OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPVerify = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Skriv inn 6-sifret OTP-kode');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });

      if (error) throw error;

      if (data.user) {
        // Create profile if it doesn't exist
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: crypto.randomUUID(),
            user_id: data.user.id,
            full_name: email.split('@')[0],
            email: email,
            account_type: role === 'business' ? 'company' : 'user',
            role: role === 'business' ? 'company' : 'user',
            metadata: {
              registration_source: 'visitor_wizard',
              lead_id: leadId
            }
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        // Associate lead with user
        if (leadId) {
          await supabase
            .from('leads')
            .update({ submitted_by: data.user.id })
            .eq('id', leadId);
        }

        toast.success('Velkommen! Du er nå logget inn.');
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || 'Ugyldig OTP-kode');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <UserPlus className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>Opprett konto og følg tilbudene dine</CardTitle>
        <p className="text-sm text-muted-foreground">
          Få tilgang til personlig dashboard og følg statusen på forespørselen din
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>E-post</Label>
          <Input value={email} disabled className="bg-muted" />
        </div>

        {step === 'password' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="password">Opprett passord</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 tegn"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handlePasswordSignup}
                disabled={isSubmitting || !password}
                className="w-full"
              >
                {isSubmitting ? 'Oppretter konto...' : 'Opprett konto'}
              </Button>
              
              <div className="text-center">
                <span className="text-sm text-muted-foreground">eller</span>
              </div>
              
              <Button 
                variant="outline"
                onClick={handleOTPRequest}
                disabled={isSubmitting}
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send passord-fri innlogging
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="otp">OTP-kode fra e-post</Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-sifret kode"
                maxLength={6}
              />
            </div>
            
            <Button 
              onClick={handleOTPVerify}
              disabled={isSubmitting || !otp}
              className="w-full"
            >
              {isSubmitting ? 'Verifiserer...' : 'Bekreft og logg inn'}
            </Button>
            
            <Button 
              variant="ghost"
              onClick={() => setStep('password')}
              className="w-full"
            >
              Tilbake til passord-registrering
            </Button>
          </>
        )}
        
        <Button 
          variant="ghost"
          onClick={onCancel}
          className="w-full"
        >
          Hopp over for nå
        </Button>
      </CardContent>
    </Card>
  );
};