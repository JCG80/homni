import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MessageSquare, Clock } from 'lucide-react';
import { LeadWizardData } from '../SmartLeadWizard';

interface ContactStepProps {
  data: LeadWizardData;
  onChange: (updates: Partial<LeadWizardData>) => void;
  errors: Record<string, string>;
}

const CONTACT_METHODS = [
  { value: 'email', label: 'E-post', icon: Mail, description: 'Vi sender deg tilbud på e-post' },
  { value: 'phone', label: 'Telefon', icon: Phone, description: 'Vi ringer deg opp for å diskutere' },
  { value: 'sms', label: 'SMS', icon: MessageSquare, description: 'Vi sender deg tilbud på SMS' }
];

const BEST_TIMES = [
  'Når som helst',
  'Morgen (08:00-12:00)',
  'Ettermiddag (12:00-17:00)',
  'Kveld (17:00-20:00)',
  'Kun hverdager',
  'Kun helger'
];

export const ContactStep: React.FC<ContactStepProps> = ({ data, onChange, errors }) => {
  return (
    <div className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="customer_name">Navn *</Label>
        <Input
          id="customer_name"
          placeholder="Ditt fulle navn"
          value={data.customer_name}
          onChange={(e) => onChange({ customer_name: e.target.value })}
          className={errors.customer_name ? 'border-red-500' : ''}
        />
        {errors.customer_name && (
          <p className="text-sm text-red-500">{errors.customer_name}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="customer_email">E-post *</Label>
        <Input
          id="customer_email"
          type="email"
          placeholder="din@epost.no"
          value={data.customer_email}
          onChange={(e) => onChange({ customer_email: e.target.value })}
          className={errors.customer_email ? 'border-red-500' : ''}
        />
        {errors.customer_email && (
          <p className="text-sm text-red-500">{errors.customer_email}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="customer_phone">Telefonnummer</Label>
        <Input
          id="customer_phone"
          placeholder="+47 XXX XX XXX"
          value={data.customer_phone || ''}
          onChange={(e) => onChange({ customer_phone: e.target.value })}
          className={errors.customer_phone ? 'border-red-500' : ''}
        />
        {errors.customer_phone && (
          <p className="text-sm text-red-500">{errors.customer_phone}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Valgfritt, men gjør det lettere for leverandører å kontakte deg
        </p>
      </div>

      {/* Preferred Contact Method */}
      <div className="space-y-3">
        <Label>Hvordan vil du helst bli kontaktet? *</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CONTACT_METHODS.map((method) => {
            const Icon = method.icon;
            return (
              <Card
                key={method.value}
                className={`cursor-pointer transition-colors ${
                  data.preferred_contact === method.value
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-muted-foreground'
                }`}
                onClick={() => onChange({ preferred_contact: method.value as any })}
              >
                <CardContent className="p-4 text-center space-y-2">
                  <Icon className={`h-6 w-6 mx-auto ${
                    data.preferred_contact === method.value ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div>
                    <p className="font-medium">{method.label}</p>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Best Time */}
      <div className="space-y-2">
        <Label htmlFor="best_time">
          <Clock className="h-4 w-4 inline mr-2" />
          Når passer det best å kontakte deg?
        </Label>
        <Select value={data.best_time} onValueChange={(value) => onChange({ best_time: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Velg tidspunkt" />
          </SelectTrigger>
          <SelectContent>
            {BEST_TIMES.map(time => (
              <SelectItem key={time} value={time.toLowerCase()}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Privacy Notice */}
      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
        <p className="text-sm font-medium">🔒 Personvern</p>
        <p className="text-xs text-muted-foreground">
          Vi deler kun dine kontaktopplysninger med kvalifiserte leverandører som matcher din forespørsel.
          Du kan alltid trekke tilbake samtykket ved å kontakte oss.
        </p>
      </div>
    </div>
  );
};