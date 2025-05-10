
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { setupMFA, verifyMFA } from '../api/auth-api';
import { toast } from '@/hooks/use-toast';

export const MFASetup = () => {
  const [step, setStep] = useState<'initial' | 'setup' | 'verify' | 'success'>('initial');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSetupMFA = async () => {
    setIsLoading(true);
    
    try {
      const result = await setupMFA();
      
      if (result.error) {
        toast({
          title: 'MFA Setup Failed',
          description: 'Could not set up MFA. Please try again.',
          variant: 'destructive'
        });
        return;
      }
      
      if (result.factorId && result.qr) {
        setFactorId(result.factorId);
        setQrCode(result.qr);
        setUri(result.uri);
        setStep('setup');
        
        // After setup, create a challenge to verify
        const { data, error } = await supabase.auth.mfa.challenge({
          factorId: result.factorId
        });
        
        if (!error && data) {
          setChallengeId(data.id);
        }
      }
    } catch (error) {
      console.error('Error setting up MFA:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!factorId || !challengeId) return;
    
    setIsLoading(true);
    
    try {
      const result = await verifyMFA(factorId, challengeId, verificationCode);
      
      if (result.verified) {
        setStep('success');
        toast({
          title: 'MFA Activated',
          description: 'Multi-factor authentication has been successfully set up.'
        });
      } else {
        toast({
          title: 'Verification Failed',
          description: 'The code you entered is invalid. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error verifying MFA:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred during verification.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'initial') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Set Up Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enhance your account security with two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Two-factor authentication adds an extra layer of security to your account. 
            In addition to your password, you'll need a code from your authentication app.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSetupMFA} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Setting up...' : 'Set up 2FA'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (step === 'setup') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scan QR Code</CardTitle>
          <CardDescription>
            Scan this code with your authentication app
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {qrCode && (
            <div className="mb-4">
              <img src={qrCode} alt="QR Code for 2FA" width={200} height={200} />
            </div>
          )}
          
          {uri && (
            <div className="w-full mb-6">
              <p className="text-xs text-muted-foreground mb-1">Or enter this code manually:</p>
              <code className="text-xs bg-muted p-2 rounded block w-full break-all overflow-x-auto">
                {uri}
              </code>
            </div>
          )}
          
          <div className="w-full">
            <p className="text-sm text-muted-foreground mb-2">Enter the 6-digit code from your authentication app:</p>
            <Input 
              type="text" 
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="text-center text-lg tracking-widest"
              maxLength={6}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleVerify}
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full"
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (step === 'success') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication Activated</CardTitle>
          <CardDescription>
            Your account is now more secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-4">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <p className="text-center text-muted-foreground">
              Two-factor authentication has been successfully set up. You'll now need to enter a code from your authentication app when signing in.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setStep('initial')} variant="outline" className="w-full">
            Done
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return null;
};
