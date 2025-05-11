
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SubmitButtonProps {
  isSubmitting: boolean;
  currentAttempt: number;
  maxRetries: number;
}

export const SubmitButton = ({ isSubmitting, currentAttempt, maxRetries }: SubmitButtonProps) => {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 5 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      <Button type="submit" className="w-full transition-all hover:shadow-md" disabled={isSubmitting}>
        {isSubmitting ? (
          <div className="flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {currentAttempt > 0 
              ? `Logger inn... (forsøk ${currentAttempt}/${maxRetries})` 
              : 'Logger inn...'}
          </div>
        ) : (
          'Logg inn'
        )}
      </Button>
    </motion.div>
  );
};
