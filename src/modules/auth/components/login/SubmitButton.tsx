
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SubmitButtonProps {
  isSubmitting: boolean;
  currentAttempt: number;
  maxRetries: number;
}

export const SubmitButton = ({ isSubmitting, currentAttempt, maxRetries }: SubmitButtonProps) => {
  const attemptsRemaining = maxRetries - currentAttempt;
  const showRetryInfo = currentAttempt > 0 && attemptsRemaining > 0;
  
  return (
    <div className="space-y-2">
      <Button 
        type="submit" 
        className="w-full h-11 transition-all"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Logger inn...</span>
          </span>
        ) : (
          'Logg inn'
        )}
      </Button>
      
      {showRetryInfo && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-center text-muted-foreground"
        >
          Innloggingsforsøk {currentAttempt} av {maxRetries}
        </motion.div>
      )}
    </div>
  );
};
