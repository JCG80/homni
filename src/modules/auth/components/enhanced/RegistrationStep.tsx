import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MobileOptimizedInput } from './MobileOptimizedInput';
import { SocialLoginButtons } from './SocialLoginButtons';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, User, Building, Lock, Shield, Check } from 'lucide-react';
import type { RegistrationData } from './EnhancedRegistrationWizard';

interface RegistrationStepProps {
  step: number;
  userType: 'private' | 'business';
  data: RegistrationData;
  onChange: (data: Partial<RegistrationData>) => void;
  error?: string | null;
  isSubmitting?: boolean;
  onSubmit?: () => void;
}

const SERVICE_INTERESTS = [
  'Boligvurdering',
  'Salgsassistanse', 
  'Boligrapporten',
  'Markedsanalyse',
  'Boligmelding',
  'Juridisk hjelp'
];

export const RegistrationStep = ({ 
  step, 
  userType, 
  data, 
  onChange, 
  error,
  isSubmitting,
  onSubmit 
}: RegistrationStepProps) => {
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground">
                Vi bruker din e-post for å opprette kontoen din
              </p>
            </div>

            <MobileOptimizedInput
              label="E-postadresse"
              type="email"
              value={data.email}
              onChange={(value) => onChange({ email: value })}
              placeholder="din@epost.no"
              autoComplete="email"
              autoFocus
              required
            />

            <div className="pt-4">
              <SocialLoginButtons userType={userType} />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                {userType === 'business' ? (
                  <Building className="h-6 w-6 text-primary" />
                ) : (
                  <User className="h-6 w-6 text-primary" />
                )}
              </div>
              <p className="text-muted-foreground">
                {userType === 'business' 
                  ? 'Fortell oss om bedriften din'
                  : 'Fortell oss om deg selv'
                }
              </p>
            </div>

            {userType === 'business' && (
              <MobileOptimizedInput
                label="Bedriftsnavn"
                type="text"
                value={data.companyName || ''}
                onChange={(value) => onChange({ companyName: value })}
                placeholder="Bedrift AS"
                autoComplete="organization"
                autoFocus
                required
              />
            )}

            <MobileOptimizedInput
              label={userType === 'business' ? 'Kontaktperson' : 'Fullt navn'}
              type="text"
              value={data.fullName || ''}
              onChange={(value) => onChange({ fullName: value })}
              placeholder="Ola Nordmann"
              autoComplete="name"
              autoFocus={userType === 'private'}
              required
            />

            <MobileOptimizedInput
              label="Telefonnummer"
              type="tel"
              value={data.phoneNumber || ''}
              onChange={(value) => onChange({ phoneNumber: value })}
              placeholder="+47 12 34 56 78"
              autoComplete="tel"
              optional
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground">
                Lag et trygt passord for kontoen din
              </p>
            </div>

            <MobileOptimizedInput
              label="Passord"
              type="password"
              value={data.password}
              onChange={(value) => onChange({ password: value })}
              placeholder="Minimum 6 tegn"
              autoComplete="new-password"
              autoFocus
              required
              minLength={6}
            />

            <Card className="bg-muted/30 border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Sikkerhetstips:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Bruk minst 6 tegn</li>
                      <li>• Kombiner bokstaver og tall</li>
                      <li>• Unngå lett gjettbare ord</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nesten ferdig!</h3>
              <p className="text-muted-foreground">
                Velg dine interesser for å få personaliserte anbefalinger
              </p>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">
                Hvilke tjenester er du interessert i? (valgfritt)
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {SERVICE_INTERESTS.map((interest) => (
                  <div
                    key={interest}
                    className="cursor-pointer"
                    onClick={() => {
                      const current = data.serviceInterests || [];
                      const updated = current.includes(interest)
                        ? current.filter(i => i !== interest)
                        : [...current, interest];
                      onChange({ serviceInterests: updated });
                    }}
                  >
                    <Badge 
                      variant={data.serviceInterests?.includes(interest) ? "default" : "outline"}
                      className="w-full justify-center py-2 px-3 cursor-pointer hover:bg-primary/10 transition-colors"
                    >
                      {interest}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <Checkbox
                id="marketing"
                checked={data.marketingConsent || false}
                onCheckedChange={(checked) => 
                  onChange({ marketingConsent: !!checked })
                }
              />
              <Label 
                htmlFor="marketing" 
                className="text-sm leading-relaxed cursor-pointer"
              >
                Jeg ønsker å motta nyheter og tilbud om Homnis tjenester
              </Label>
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <div className="text-sm space-y-2">
                  <p className="font-medium">Ved å registrere deg samtykker du til:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Homnis <span className="text-primary cursor-pointer hover:underline">brukervilkår</span></li>
                    <li>• Vår <span className="text-primary cursor-pointer hover:underline">personvernpolicy</span></li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {renderStep()}
    </div>
  );
};