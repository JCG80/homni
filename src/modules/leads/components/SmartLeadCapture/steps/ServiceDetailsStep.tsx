import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Home, MapPin, Calendar, Info } from 'lucide-react';
import { LeadWizardData } from '../SmartLeadWizard';

interface ServiceDetailsStepProps {
  data: LeadWizardData;
  onChange: (updates: Partial<LeadWizardData>) => void;
  errors: Record<string, string>;
}

const PROPERTY_TYPES = [
  'Leilighet',
  'Enebolig',
  'Rekkehus',
  'Tomannsbolig',
  'Hytte/fritidsbolig',
  'Næringsbygg',
  'Annet'
];

const PROJECT_TIMELINES = [
  'Så snart som mulig',
  'I løpet av 1 uke',
  'I løpet av 1 måned',
  'I løpet av 3 måneder',
  'I løpet av 6 måneder',
  'Mer enn 6 måneder',
  'Vet ikke'
];

export const ServiceDetailsStep: React.FC<ServiceDetailsStepProps> = ({ data, onChange, errors }) => {
  // Show different fields based on category
  const shouldShowPropertyFields = ['bolig', 'bygg', 'renovering', 'rørlegger', 'elektriker'].includes(data.category);

  return (
    <div className="space-y-6">
      {/* Service Type */}
      <div className="space-y-2">
        <Label htmlFor="service_type">Type tjeneste *</Label>
        <Input
          id="service_type"
          placeholder={`F.eks. ${data.category === 'elektriker' ? 'Installasjon av ladestasjon' : 'Beskriv tjenesten du trenger'}`}
          value={data.service_type}
          onChange={(e) => onChange({ service_type: e.target.value })}
          className={errors.service_type ? 'border-red-500' : ''}
        />
        {errors.service_type && (
          <p className="text-sm text-red-500">{errors.service_type}</p>
        )}
      </div>

      {/* Property-specific fields */}
      {shouldShowPropertyFields && (
        <>
          {/* Property Type */}
          <div className="space-y-2">
            <Label htmlFor="property_type">
              <Home className="h-4 w-4 inline mr-2" />
              Type eiendom
            </Label>
            <Select value={data.property_type} onValueChange={(value) => onChange({ property_type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Velg type eiendom" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map(type => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Property Address */}
          <div className="space-y-2">
            <Label htmlFor="property_address">
              <MapPin className="h-4 w-4 inline mr-2" />
              Adresse eller område
            </Label>
            <Input
              id="property_address"
              placeholder="F.eks. 'Oslo sentrum' eller full adresse"
              value={data.property_address || ''}
              onChange={(e) => onChange({ property_address: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Dette hjelper oss å finne leverandører i ditt område
            </p>
          </div>
        </>
      )}

      {/* Project Timeline */}
      <div className="space-y-2">
        <Label htmlFor="project_timeline">
          <Calendar className="h-4 w-4 inline mr-2" />
          Når skal arbeidet utføres?
        </Label>
        <Select value={data.project_timeline} onValueChange={(value) => onChange({ project_timeline: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Velg tidsramme" />
          </SelectTrigger>
          <SelectContent>
            {PROJECT_TIMELINES.map(timeline => (
              <SelectItem key={timeline} value={timeline.toLowerCase()}>
                {timeline}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Additional Info */}
      <div className="space-y-2">
        <Label htmlFor="additional_info">
          <Info className="h-4 w-4 inline mr-2" />
          Tilleggsinformasjon
        </Label>
        <Textarea
          id="additional_info"
          placeholder="Er det noe annet vi bør vite? F.eks. tilgjengelighet, spesielle krav, tidligere erfaringer..."
          value={data.additional_info || ''}
          onChange={(e) => onChange({ additional_info: e.target.value })}
          rows={3}
        />
      </div>

      {/* Quality Score Indicator */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Kvalitet på forespørsel</p>
              <p className="text-sm text-muted-foreground">
                Jo mer informasjon, desto bedre tilbud får du
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {Math.min(100, Math.max(20, 
                  (data.title ? 20 : 0) + 
                  (data.description.length > 50 ? 25 : data.description.length > 20 ? 15 : 0) + 
                  (data.service_type ? 20 : 0) + 
                  (data.property_address ? 15 : 0) + 
                  (data.project_timeline ? 10 : 0) + 
                  (data.additional_info ? 10 : 0)
                ))}%
              </div>
              <p className="text-xs text-muted-foreground">komplett</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};