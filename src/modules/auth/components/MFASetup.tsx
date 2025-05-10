
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { setupMFA, verifyMFA } from '../api/auth-api';
import { toast } from '@/hooks/use-toast';

export const MFASetup = () => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<{
    factorId: string | null;
    qr: string | null;
    uri: string | null;
  }>({ factorId: null, qr: null, uri: null });
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleStartEnrollment = async () => {
    setIsLoading(true);
    try {
      const { factorId, qr, uri, error } = await setupMFA();
      
      if (error || !factorId) {
        toast({
          title: "Feil ved MFA-oppsett",
          description: "Kunne ikke starte MFA-oppsett. Vennligst prøv igjen senere.",
          variant: "destructive",
        });
        return;
      }
      
      setEnrollmentData({ factorId, qr, uri });
      setIsEnrolling(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!enrollmentData.factorId) {
      toast({
        title: "Manglende data",
        description: "MFA-oppsettet mangler nødvendig informasjon. Vennligst start på nytt.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // We're passing factorId and the verification code to verifyMFA
      const { verified, error } = await verifyMFA(
        enrollmentData.factorId,
        "", // Passing empty string for challengeId as it's not used
        verificationCode
      );
      
      if (error || !verified) {
        toast({
          title: "Verifiseringsfeil",
          description: "Koden er ugyldig. Vennligst prøv igjen.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "MFA aktivert",
        description: "Tofaktorautentisering er nå aktivert for din konto.",
      });
      
      setIsEnrolling(false);
      setIsVerifying(false);
      setVerificationCode('');
      setEnrollmentData({ factorId: null, qr: null, uri: null });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEnrolling) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>To-faktor autentisering</CardTitle>
          <CardDescription>
            Øk sikkerheten på kontoen din med to-faktor autentisering. Du vil trenge en 
            autentiseringsapp som Google Authenticator eller Authy.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button 
            onClick={handleStartEnrollment} 
            disabled={isLoading}
          >
            {isLoading ? 'Laster...' : 'Aktiver to-faktor autentisering'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (isEnrolling && !isVerifying && enrollmentData.qr) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sett opp autentiseringsappen din</CardTitle>
          <CardDescription>
            Skann QR-koden med autentiseringsappen din eller skriv inn nøkkelen manuelt.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {enrollmentData.qr && (
            <div className="border border-gray-200 p-2 rounded">
              <img 
                src={enrollmentData.qr} 
                alt="QR Code for MFA" 
                className="w-64 h-64"
              />
            </div>
          )}
          
          {enrollmentData.uri && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 mb-2">Eller skriv inn denne koden manuelt:</p>
              <code className="bg-gray-100 p-2 rounded text-xs break-all">
                {enrollmentData.uri.split('=').pop()}
              </code>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setIsEnrolling(false)} 
            disabled={isLoading}
          >
            Avbryt
          </Button>
          <Button 
            onClick={() => setIsVerifying(true)} 
            disabled={isLoading}
          >
            Fortsett
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (isVerifying) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verifiser autentiseringsapp</CardTitle>
          <CardDescription>
            Skriv inn den 6-sifrede koden fra autentiseringsappen din for å bekrefte oppsettet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Skriv inn 6-sifret kode"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={6}
            className="text-center text-lg tracking-widest"
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setIsVerifying(false)} 
            disabled={isLoading}
          >
            Tilbake
          </Button>
          <Button 
            onClick={handleVerify} 
            disabled={isLoading || verificationCode.length !== 6}
          >
            {isLoading ? 'Verifiserer...' : 'Bekreft'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return null;
};
