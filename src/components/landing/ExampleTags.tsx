
import React from 'react';
import { Button } from '@/components/ui/button';

interface ExampleTagsProps {
  userType: 'private' | 'business';
  onTagSelect: (service: string) => void;
  selectedService?: string;
}

export const ExampleTags = ({ userType, onTagSelect, selectedService }: ExampleTagsProps) => {
  const privateExamples = [
    { id: 'strom', name: 'Strøm' },
    { id: 'mobil', name: 'Mobil' },
    { id: 'forsikring', name: 'Forsikring' },
    { id: 'bredband', name: 'Bredbånd' },
  ];

  const businessExamples = [
    { id: 'energiavtaler', name: 'Energiavtaler' },
    { id: 'bedriftsforsikring', name: 'Forsikring' },
    { id: 'kaiplass', name: 'Kai' },
    { id: 'transport', name: 'Transport' },
  ];

  const examples = userType === 'private' ? privateExamples : businessExamples;

  return (
    <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Service examples">
      <p className="w-full text-center text-sm text-muted-foreground mb-2">Eksempler:</p>
      <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
        {examples.map((example) => {
          const isSelected = selectedService === example.id;
          return (
            <Button
              key={example.id}
              variant="outline"
              size="sm"
              className={`
                bg-muted hover:bg-muted/80 
                focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                transition-colors duration-200
                ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'border-muted-foreground/20'}
              `}
              onClick={() => onTagSelect(example.id)}
              aria-pressed={isSelected}
              aria-label={`Select ${example.name} service`}
            >
              {example.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
