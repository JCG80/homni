
import React from 'react';
import { Button } from '@/components/ui/button';

interface ExampleTagsProps {
  userType: 'private' | 'business';
  onTagSelect: (service: string) => void;
}

export const ExampleTags = ({ userType, onTagSelect }: ExampleTagsProps) => {
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
    { id: 'flatestyring', name: 'Transport' },
  ];

  const examples = userType === 'private' ? privateExamples : businessExamples;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <p className="w-full text-center text-sm mb-2">Eksempler:</p>
      {examples.map((example) => (
        <Button
          key={example.id}
          variant="outline"
          size="sm"
          className="bg-white/20 border-white/30 hover:bg-white/30 text-white"
          onClick={() => onTagSelect(example.id)}
        >
          {example.name}
        </Button>
      ))}
    </div>
  );
};
