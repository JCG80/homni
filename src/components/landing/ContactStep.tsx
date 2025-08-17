import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface ContactStepProps {
  role: 'private' | 'business';
  formData: {
    name: string;
    email: string;
    phone: string;
    companyName?: string;
    consent: boolean;
  };
  onDataChange: (updates: any) => void;
}

export const ContactStep = ({ role, formData, onDataChange }: ContactStepProps) => {
  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">
          Kontaktinformasjon
        </h2>
        <p className="text-muted-foreground">
          Vi trenger disse opplysningene for å sende deg tilbud
        </p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            {role === 'business' ? 'Kontaktperson' : 'Navn'} *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder={role === 'business' ? 'Ola Nordmann' : 'Ditt fulle navn'}
            value={formData.name}
            onChange={(e) => onDataChange({ name: e.target.value })}
            required
          />
        </div>

        {/* Company Name (business only) */}
        {role === 'business' && (
          <div className="space-y-2">
            <Label htmlFor="companyName">Bedriftsnavn</Label>
            <Input
              id="companyName"
              type="text"
              placeholder="Din bedrift AS"
              value={formData.companyName || ''}
              onChange={(e) => onDataChange({ companyName: e.target.value })}
            />
          </div>
        )}

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">E-post *</Label>
          <Input
            id="email"
            type="email"
            placeholder="din@epost.no"
            value={formData.email}
            onChange={(e) => onDataChange({ email: e.target.value })}
            required
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="123 45 678"
            value={formData.phone}
            onChange={(e) => onDataChange({ phone: e.target.value })}
            required
          />
        </div>

        {/* Consent */}
        <div className="flex items-start space-x-2 pt-4">
          <Checkbox
            id="consent"
            checked={formData.consent}
            onCheckedChange={(checked) => onDataChange({ consent: checked })}
            required
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="consent"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Jeg samtykker til at Homni kontakter meg *
            </Label>
            <p className="text-xs text-muted-foreground">
              Vi bruker kun opplysningene dine til å sende relevante tilbud. 
              Du kan trekke tilbake samtykket når som helst.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};