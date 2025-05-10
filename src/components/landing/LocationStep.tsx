
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface LocationStepProps {
  userType: 'private' | 'business';
  selectedService: string;
  onPrevStep: () => void;
  onNextStep: (locationData: { postalCode: string; propertyType: string }) => void;
}

export const LocationStep = ({ 
  userType, 
  selectedService, 
  onPrevStep, 
  onNextStep 
}: LocationStepProps) => {
  const [postalCode, setPostalCode] = useState("");
  const [propertyType, setPropertyType] = useState("");

  const propertyTypes = userType === 'private' 
    ? ['Leilighet', 'Enebolig', 'Rekkehus', 'Hytte']
    : ['Kontor', 'Butikk', 'Lager', 'Produksjon', 'Annet'];

  const handleNext = () => {
    if (postalCode && propertyType) {
      onNextStep({ postalCode, propertyType });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6 text-center">
        <div className="text-sm text-gray-500 mb-2">Steg 2 av 3 – tar under 1 minutt</div>
        <Progress value={66} className="h-2" />
      </div>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">Hvor befinner du deg?</h2>
          <Input
            type="text"
            placeholder="Postnummer"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="h-12"
          />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-3">Hva slags {userType === 'private' ? 'bolig' : 'lokale'} gjelder det?</h2>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="w-full h-12">
              <SelectValue placeholder={`Velg ${userType === 'private' ? 'boligtype' : 'lokaltype'}`} />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={onPrevStep}
            className="flex-1 h-12"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Tilbake
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!postalCode || !propertyType}
            className="flex-1 h-12"
          >
            Neste <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
