
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormErrorProps {
  error: string | null;
}

export const FormError = ({ error }: FormErrorProps) => {
  if (!error) return null;
  
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-destructive/15 text-destructive rounded-md p-3 flex items-start space-x-2"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{error}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
