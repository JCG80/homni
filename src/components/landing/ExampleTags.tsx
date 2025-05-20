
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    <div 
      className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto mt-4" 
      role="group" 
      aria-label="Service examples"
    >
      {examples.map((example) => {
        const isSelected = selectedService === example.id;
        return (
          <Button
            key={example.id}
            variant={isSelected ? "default" : "soft"}
            size="sm"
            rounded="full"
            className={cn(
              "px-6 py-2 transition-all duration-200 hover:scale-105",
              isSelected 
                ? "shadow-sm" 
                : "hover:-translate-y-0.5"
            )}
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
