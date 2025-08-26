import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

interface LocationContextStepProps {
  role: 'private' | 'business';
  service: string;
  formData: {
    postalCode: string;
    propertyType: string;
    propertyAge?: string;
    propertyCondition?: string;
    specialNeeds?: string[];
    consumption?: string;
    employees?: string;
  };
  onDataChange: (updates: any) => void;
}

const privatePropertyTypes = [
  { value: 'enebolig', label: 'Enebolig' },
  { value: 'leilighet', label: 'Leilighet' },
  { value: 'rekkehus', label: 'Rekkehus/tomannsbolig' },
  { value: 'hytte', label: 'Hytte/fritidsbolig' },
];

const businessPropertyTypes = [
  { value: 'kontor', label: 'Kontor' },
  { value: 'lager', label: 'Lager' },
  { value: 'industri', label: 'Industri' },
  { value: 'butikk', label: 'Butikk/handel' },
  { value: 'restaurant', label: 'Restaurant/kafé' },
];

const propertyAges = [
  { value: 'ny', label: 'Under 10 år' },
  { value: 'middels', label: '10-30 år' },
  { value: 'eldre', label: 'Over 30 år' },
];

const propertyConditions = [
  { value: 'god', label: 'God tilstand' },
  { value: 'ok', label: 'Trenger mindre oppussing' },
  { value: 'darlig', label: 'Trenger større renovering' },
];

export const LocationContextStep = ({ role, service, formData, onDataChange }: LocationContextStepProps) => {
  const propertyTypes = role === 'business' ? businessPropertyTypes : privatePropertyTypes;
  
  const getSpecialNeedsOptions = () => {
    if (service === 'tilgjengelighet') {
      return ['Rullestoltilgang', 'Trappeheis', 'Badromstilpasning', 'Kjøkkentilpasning'];
    }
    if (service === 'energi') {
      return ['Høyt strømforbruk', 'Dårlig isolering', 'Gamle vinduer', 'Gammel oppvarming'];
    }
    return ['Fuktproblemer', 'Vedlikeholdsbehov', 'Sikkerhetsbehov', 'Annet'];
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">
          {role === 'business' ? 'Om bedriftens lokaler' : 'Om boligen din'}
        </h2>
        <p className="text-lg text-muted-foreground">
          {role === 'business' 
            ? 'Dette hjelper oss å finne riktige leverandører for deres behov'
            : 'Jo mer vi vet, desto bedre tilbud kan vi finne'
          }
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Postal Code */}
            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-base font-medium">
                Postnummer *
              </Label>
              <Input
                id="postalCode"
                type="text"
                placeholder="f.eks. 0150"
                value={formData.postalCode}
                onChange={(e) => onDataChange({ postalCode: e.target.value })}
                maxLength={4}
                pattern="[0-9]{4}"
                required
                className="text-base"
              />
            </div>

            {/* Property Type */}
            <div className="space-y-2">
              <Label htmlFor="propertyType" className="text-base font-medium">
                {role === 'business' ? 'Type bedrift' : 'Type bolig'} *
              </Label>
              <Select 
                value={formData.propertyType} 
                onValueChange={(value) => onDataChange({ propertyType: value })}
              >
                <SelectTrigger className="text-base">
                  <SelectValue placeholder={`Velg ${role === 'business' ? 'bedriftstype' : 'boligtype'}`} />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Property Age (for private) */}
            {role === 'private' && (
              <div className="space-y-2">
                <Label htmlFor="propertyAge" className="text-base font-medium">
                  Boligens alder
                </Label>
                <Select 
                  value={formData.propertyAge || ''} 
                  onValueChange={(value) => onDataChange({ propertyAge: value })}
                >
                  <SelectTrigger className="text-base">
                    <SelectValue placeholder="Velg alder" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyAges.map((age) => (
                      <SelectItem key={age.value} value={age.value}>
                        {age.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Property Condition */}
            <div className="space-y-2">
              <Label htmlFor="propertyCondition" className="text-base font-medium">
                {role === 'business' ? 'Lokalenes tilstand' : 'Boligens tilstand'}
              </Label>
              <Select 
                value={formData.propertyCondition || ''} 
                onValueChange={(value) => onDataChange({ propertyCondition: value })}
              >
                <SelectTrigger className="text-base">
                  <SelectValue placeholder="Velg tilstand" />
                </SelectTrigger>
                <SelectContent>
                  {propertyConditions.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Size (for business) */}
            {role === 'business' && (
              <div className="space-y-2">
                <Label htmlFor="employees" className="text-base font-medium">
                  Antall ansatte
                </Label>
                <Input
                  id="employees"
                  type="text"
                  placeholder="f.eks. 25"
                  value={formData.employees || ''}
                  onChange={(e) => onDataChange({ employees: e.target.value })}
                  className="text-base"
                />
              </div>
            )}
          </div>
        </div>

        {/* Special Needs Section */}
        <Card className="mt-8 p-6 bg-muted/30">
          <h3 className="text-lg font-semibold mb-4">
            {service === 'tilgjengelighet' 
              ? 'Hvilke tilgjengelighetsløsninger trenger dere?'
              : service === 'energi'
              ? 'Hva ønsker dere å forbedre?'
              : 'Spesielle behov eller ønsker?'
            }
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {getSpecialNeedsOptions().map((option) => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox"
                  className="rounded border-gray-300"
                  onChange={(e) => {
                    const current = formData.specialNeeds || [];
                    const updated = e.target.checked 
                      ? [...current, option]
                      : current.filter(item => item !== option);
                    onDataChange({ specialNeeds: updated });
                  }}
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Potential Savings Hint */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-800">
            💡 <strong>Visste du at:</strong> {
              service === 'energi' 
                ? 'En varmepumpe kan redusere strømregningen med 30-50%'
                : service === 'okonomi'
                ? 'Refinansiering kan spare deg for tusenvis av kroner årlig'
                : service === 'tilgjengelighet'
                ? 'Du kan få støtte fra NAV og kommunen til tilgjengelighetstiltak'
                : 'Riktige håndverkere sparer deg tid og penger på lang sikt'
            }
          </p>
        </div>
      </div>
    </div>
  );
};