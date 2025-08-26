import React, { useState } from 'react';
import { CheckCircle, Mail, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LightRegistrationFlow } from './LightRegistrationFlow';
import { useAuth } from '@/modules/auth/hooks';
import { useNavigate } from 'react-router-dom';

interface SuccessStepProps {
  role: 'private' | 'business';
  email: string;
  leadId?: string;
}

export const SuccessStep = ({ role, email, leadId }: SuccessStepProps) => {
  const [showRegistration, setShowRegistration] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleRegistrationSuccess = () => {
    navigate('/dashboard');
  };
  return (
    <div className="text-center max-w-lg mx-auto">
      <div className="mb-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          Takk for din forespørsel!
        </h2>
        <p className="text-muted-foreground">
          Vi har mottatt din forespørsel og jobber nå med å finne de beste tilbudene for deg.
        </p>
      </div>

      <div className="bg-muted/30 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-4">Hva skjer nå?</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium">Du får en bekreftelse på e-post</p>
              <p className="text-muted-foreground">Sendt til {email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium">Vi matcher deg med riktige leverandører</p>
              <p className="text-muted-foreground">Basert på dine behov og preferanser</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium">Du blir kontaktet innen 24 timer</p>
              <p className="text-muted-foreground">Få personlige tilbud direkte fra leverandørene</p>
            </div>
          </div>
        </div>
      </div>

      {!isAuthenticated && !showRegistration && (
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg mb-6 border border-primary/20">
          <div className="text-center">
            <h3 className="font-semibold mb-2 text-primary">Følg tilbudene dine live!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Opprett en gratis konto for å følge statusen på forespørselen din og motta alle tilbudene på ett sted.
            </p>
            <Button 
              onClick={() => setShowRegistration(true)}
              className="w-full mb-3"
            >
              Opprett gratis konto
            </Button>
            <p className="text-xs text-muted-foreground">
              Ingen bindinger • Gratis for alltid • Slett når du vil
            </p>
          </div>
        </div>
      )}

      {showRegistration ? (
        <LightRegistrationFlow
          email={email}
          role={role}
          leadId={leadId}
          onSuccess={handleRegistrationSuccess}
          onCancel={() => setShowRegistration(false)}
        />
      ) : (
        <div className="space-y-3">
          {isAuthenticated && (
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Se mine forespørsler
            </Button>
          )}
          
          <Button 
            onClick={() => window.location.reload()}
            variant={isAuthenticated ? "outline" : "default"}
            className="w-full"
          >
            Send ny forespørsel
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Tilbake til forsiden
          </Button>
        </div>
      )}
    </div>
  );
};