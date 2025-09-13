import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

interface PricingStepProps {
  selectedPlan: string;
  onPlanSelect: (planId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Gratis',
    price: '0 kr/mnd',
    description: 'Perfekt for å komme i gang',
    features: [
      'Opptil 2 eiendommer',
      'Grunnleggende dokumentlagring',
      'E-post støtte',
      'Mobil app'
    ]
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '199 kr/mnd',
    description: 'For private eiere med flere eiendommer',
    features: [
      'Ubegrensede eiendommer',
      'Avansert dokumentlagring',
      'Vedlikeholdsplanlegging',
      'Prioritert støtte',
      'Verdisporing',
      'Rapporter og analyser'
    ],
    recommended: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '499 kr/mnd',
    description: 'For bedrifter og profesjonelle',
    features: [
      'Alt i Standard',
      'Teamfunksjonalitet',
      'API tilgang',
      'Dedikert kundekontakt',
      'Tilpassede rapporter',
      'Integrasjoner'
    ]
  }
];

export const PricingStep: React.FC<PricingStepProps> = ({
  selectedPlan,
  onPlanSelect,
  onNext,
  onBack,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Velg din plan</h2>
        <p className="text-muted-foreground">
          Du kan alltid endre planen din senere
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedPlan === plan.id 
                ? 'ring-2 ring-primary border-primary' 
                : ''
            } ${plan.recommended ? 'relative' : ''}`}
            onClick={() => onPlanSelect(plan.id)}
          >
            {plan.recommended && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-orange-400 to-pink-600 text-white flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Anbefalt
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <div className="text-2xl font-bold text-primary">{plan.price}</div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>
            
            <CardContent className="pt-0">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                type="button"
                variant={selectedPlan === plan.id ? 'default' : 'outline'}
                onClick={() => onPlanSelect(plan.id)}
                className="w-full mt-4"
              >
                {selectedPlan === plan.id ? 'Valgt' : 'Velg denne planen'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Note about free trial */}
      <div className="text-center text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
        💡 Alle betalte planer kommer med 14 dagers gratis prøveperiode. 
        Ingen binding - kanseller når som helst.
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Tilbake
        </Button>
        
        <Button
          type="submit"
          className="flex items-center gap-2"
        >
          Fortsett
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};