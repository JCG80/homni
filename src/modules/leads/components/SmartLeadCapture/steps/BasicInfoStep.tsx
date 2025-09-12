import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb } from 'lucide-react';
import { LeadWizardData } from '../SmartLeadWizard';
import { LEAD_CATEGORIES } from '../../../constants/lead-constants';

interface BasicInfoStepProps {
  data: LeadWizardData;
  onChange: (updates: Partial<LeadWizardData>) => void;
  errors: Record<string, string>;
}

const URGENCY_OPTIONS = [
  { value: 'low', label: 'Lav - Ikke hastverk', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Middels - I løpet av noen uker', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'Høy - Så snart som mulig', color: 'bg-red-100 text-red-800' }
];

const BUDGET_RANGES = [
  'Under 5,000 kr',
  '5,000 - 15,000 kr',
  '15,000 - 50,000 kr',
  '50,000 - 100,000 kr',
  '100,000 - 250,000 kr',
  'Over 250,000 kr',
  'Vet ikke'
];

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, onChange, errors }) => {
  const handleCategorySelect = (category: string) => {
    onChange({ category });
  };

  const handleSuggestedCategorySelect = (category: string) => {
    onChange({ category });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Tittel på forespørsel *</Label>
        <Input
          id="title"
          placeholder="F.eks. 'Trenger elektriker til hovedtavle'"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className={errors.title ? 'border-red-500' : ''}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Beskriv hva du trenger hjelp med *</Label>
        <Textarea
          id="description"
          placeholder="Beskriv ditt prosjekt i detalj. Jo mer informasjon, desto bedre kan vi matche deg med riktig leverandør..."
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Minimum 20 tegn for best resultat
        </p>
      </div>

      {/* AI Suggestions */}
      {data.suggested_categories && data.suggested_categories.length > 0 && (
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Foreslåtte kategorier basert på beskrivelsen:</p>
              <div className="flex flex-wrap gap-2">
                {data.suggested_categories.map((category) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => handleSuggestedCategorySelect(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Kategori *</Label>
        <Select value={data.category} onValueChange={handleCategorySelect}>
          <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
            <SelectValue placeholder="Velg kategori" />
          </SelectTrigger>
          <SelectContent>
            {LEAD_CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category}</p>
        )}
      </div>

      {/* Urgency */}
      <div className="space-y-2">
        <Label>Hvor raskt trenger du hjelp? *</Label>
        <div className="grid grid-cols-1 gap-2">
          {URGENCY_OPTIONS.map((option) => (
            <div
              key={option.value}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                data.urgency === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-muted-foreground'
              }`}
              onClick={() => onChange({ urgency: option.value as any })}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{option.label}</span>
                <Badge className={option.color}>
                  {option.value.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Range */}
      <div className="space-y-2">
        <Label htmlFor="budget">Omtrentlig budsjett (valgfritt)</Label>
        <Select value={data.budget_range} onValueChange={(value) => onChange({ budget_range: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Velg budsjettområde" />
          </SelectTrigger>
          <SelectContent>
            {BUDGET_RANGES.map(range => (
              <SelectItem key={range} value={range}>
                {range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Dette hjelper oss å finne leverandører i riktig prisklasse
        </p>
      </div>
    </div>
  );
};