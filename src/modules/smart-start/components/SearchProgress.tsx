import React from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Mail, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SearchProgressProps {
  currentStep: number;
  isSearching: boolean;
  query: string;
}

const steps = [
  { id: 1, label: 'Søk', icon: Search, description: 'Hva leter du etter?' },
  { id: 2, label: 'Sted', icon: MapPin, description: 'Hvor skal tjenesten utføres?' },
  { id: 3, label: 'Kontakt', icon: Mail, description: 'Hvordan kan vi nå deg?' },
  { id: 4, label: 'Ferdig', icon: CheckCircle, description: 'Du får tilbud snart!' }
];

export const SearchProgress: React.FC<SearchProgressProps> = ({
  currentStep,
  isSearching,
  query
}) => {
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto mb-12">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            Steg {currentStep} av {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {currentStep === steps.length ? 'Fullført!' : 'Ca. 1 minutt igjen'}
          </span>
        </div>
        
        <Progress 
          value={progressPercentage} 
          className="w-full h-2"
        />
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isUpcoming = currentStep < step.id;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex flex-col items-center p-4 rounded-lg border transition-all duration-300
                ${isActive ? 'bg-primary/10 border-primary text-primary' : ''}
                ${isCompleted ? 'bg-success/10 border-success text-success' : ''}
                ${isUpcoming ? 'bg-muted/50 border-muted text-muted-foreground' : ''}
              `}
            >
              <div className={`
                p-2 rounded-full mb-2 transition-all duration-300
                ${isActive ? 'bg-primary text-primary-foreground' : ''}
                ${isCompleted ? 'bg-success text-success-foreground' : ''}
                ${isUpcoming ? 'bg-muted text-muted-foreground' : ''}
              `}>
                <Icon className="w-4 h-4" />
              </div>
              
              <span className="font-medium text-sm text-center">
                {step.label}
              </span>
              
              <span className="text-xs text-center mt-1 opacity-70">
                {step.description}
              </span>

              {isActive && isSearching && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-3 h-3 border border-primary border-t-transparent rounded-full mt-2"
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Current Query Display */}
      {query && currentStep > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-card rounded-lg border text-center"
        >
          <span className="text-sm text-muted-foreground">Du søker etter: </span>
          <span className="font-medium text-primary">{query}</span>
        </motion.div>
      )}
    </div>
  );
};