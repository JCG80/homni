import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LocationContextStepProps {
  role: 'private' | 'business';
  service: string;
  formData: {
    postalCode: string;
    propertyType: string;
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

export const LocationContextStep = ({ role, service, formData, onDataChange }: LocationContextStepProps) => {
  const propertyTypes = role === 'business' ? businessPropertyTypes : privatePropertyTypes;
  
  const getContextLabel = () => {
    if (role === 'business') return 'Antall ansatte';
    if (service === 'strom' || service === 'energi') return 'Årlig forbruk (kWh)';
    return 'Månedlig forbruk';
  };

  const getContextPlaceholder = () => {
    if (role === 'business') return 'f.eks. 25';
    if (service === 'strom' || service === 'energi') return 'f.eks. 15000';
    return 'f.eks. 500';
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">
          Fortell oss litt om {role === 'business' ? 'bedriften' : 'boligen'} din
        </h2>
        <p className="text-muted-foreground">
          Dette hjelper oss å finne de beste tilbudene for deg
        </p>
      </div>

      <div className="space-y-6 max-w-md mx-auto">
        {/* Postal Code */}
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postnummer *</Label>
          <Input
            id="postalCode"
            type="text"
            placeholder="f.eks. 0150"
            value={formData.postalCode}
            onChange={(e) => onDataChange({ postalCode: e.target.value })}
            maxLength={4}
            pattern="[0-9]{4}"
            required
          />
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <Label htmlFor="propertyType">
            {role === 'business' ? 'Type bedrift' : 'Type bolig'} *
          </Label>
          <Select 
            value={formData.propertyType} 
            onValueChange={(value) => onDataChange({ propertyType: value })}
          >
            <SelectTrigger>
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

        {/* Context-specific field */}
        {(service === 'strom' || service === 'energi' || role === 'business') && (
          <div className="space-y-2">
            <Label htmlFor="context">
              {getContextLabel()}
              {role !== 'business' && (
                <span className="text-muted-foreground ml-1">(valgfritt)</span>
              )}
            </Label>
            <Input
              id="context"
              type="text"
              placeholder={getContextPlaceholder()}
              value={role === 'business' ? formData.employees || '' : formData.consumption || ''}
              onChange={(e) => {
                if (role === 'business') {
                  onDataChange({ employees: e.target.value });
                } else {
                  onDataChange({ consumption: e.target.value });
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};