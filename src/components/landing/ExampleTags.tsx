
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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

  // Animation variants
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto mt-6" 
      role="group" 
      aria-label="Service examples"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {examples.map((example) => {
        const isSelected = selectedService === example.id;
        return (
          <motion.div key={example.id} variants={item}>
            <Button
              variant={isSelected ? "default" : "soft"}
              size="sm"
              rounded="full"
              className={cn(
                "px-6 py-2 transition-all duration-300 hover:scale-105 shadow-sm",
                isSelected 
                  ? "shadow-md shadow-primary/20" 
                  : "hover:-translate-y-1 hover:shadow-md"
              )}
              onClick={() => onTagSelect(example.id)}
              aria-pressed={isSelected}
              aria-label={`Select ${example.name} service`}
            >
              {example.name}
            </Button>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
