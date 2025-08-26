import React, { useState } from 'react';
import { CheckCircle, Mail, Clock, Users, TrendingDown, Shield, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LightRegistrationFlow } from './LightRegistrationFlow';
import { useAuth } from '@/modules/auth/hooks';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

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

  const getSavingsEstimate = () => {
    if (role === 'business') {
      return {
        amount: '25,000 - 150,000',
        period: 'årlig',
        description: 'på energi- og vedlikeholdskostnader'
      };
    }
    return {
      amount: '5,000 - 25,000',
      period: 'årlig', 
      description: 'på strøm, forsikring og boligtjenester'
    };
  };

  const savings = getSavingsEstimate();

  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold mb-4">
          Forespørselen er sendt!
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          Vi jobber nå med å finne de beste {role === 'business' ? 'leverandørene' : 'tilbudene'} for deg.
        </p>
        
        {/* Savings Estimate */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 p-6 mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <TrendingDown className="h-6 w-6 text-green-600" />
            <h3 className="text-xl font-semibold">Potensielle besparelser</h3>
          </div>
          <div className="text-3xl font-bold text-green-700 mb-2">
            {savings.amount} kr {savings.period}
          </div>
          <p className="text-sm text-muted-foreground">
            {savings.description}
          </p>
        </Card>
      </div>

      {/* Process Steps */}
      <div className="bg-muted/30 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-6">Hva skjer nå?</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Bekreftelse på e-post</p>
              <p className="text-sm text-muted-foreground">
                Du får en bekreftelse på {email} med alle detaljene
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Matching med leverandører</p>
              <p className="text-sm text-muted-foreground">
                Vi finner de beste leverandørene basert på dine behov og beliggenhet
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Personlige tilbud innen 24 timer</p>
              <p className="text-sm text-muted-foreground">
                Leverandørene kontakter deg direkte med skreddersydde tilbud
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Star className="h-5 w-5 text-yellow-500 fill-current" />
          <Star className="h-5 w-5 text-yellow-500 fill-current" />
          <Star className="h-5 w-5 text-yellow-500 fill-current" />
          <Star className="h-5 w-5 text-yellow-500 fill-current" />
          <Star className="h-5 w-5 text-yellow-500 fill-current" />
          <span className="ml-2 text-sm text-muted-foreground">4.8/5 basert på 2,341 anmeldelser</span>
        </div>
        <blockquote className="text-sm italic text-muted-foreground max-w-md mx-auto">
          "Fantastisk service! Jeg sparte over 15,000 kr på varmepumpe og fikk den installert på en uke."<br />
          <cite className="text-xs not-italic">– Maria, Oslo</cite>
        </blockquote>
      </div>

      {/* Registration CTA for unauthenticated users */}
      {!isAuthenticated && !showRegistration && (
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 mb-6 border border-primary/20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold text-primary">Hold oversikt over tilbudene</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Opprett en gratis konto for å følge alle tilbudene på ett sted og få varsler når nye kommer inn.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => setShowRegistration(true)}
              className="w-full"
              size="lg"
            >
              Opprett gratis konto
            </Button>
            <p className="text-xs text-muted-foreground">
              ✓ Ingen bindinger  ✓ Gratis for alltid  ✓ Slett når du vil
            </p>
          </div>
        </Card>
      )}

      {/* Registration Flow */}
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
              size="lg"
            >
              Se mine forespørsler
            </Button>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => window.location.reload()}
              variant={isAuthenticated ? "outline" : "default"}
              className="flex-1"
              size="lg"
            >
              Send ny forespørsel
            </Button>
            
            <Button 
              asChild
              variant="outline" 
              className="flex-1"
              size="lg"
            >
              <Link to="/about">
                Les mer om oss <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
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