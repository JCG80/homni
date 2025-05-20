
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
    <div className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto mt-4" role="group" aria-label="Service examples">
      {examples.map((example) => {
        const isSelected = selectedService === example.id;
        return (
          <Button
            key={example.id}
            variant="outline"
            size="sm"
            className={`
              px-6 py-2 rounded-full border transition-all duration-200
              ${isSelected 
                ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                : 'bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 border-transparent hover:scale-105'}
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
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
  );
};
