
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { Control } from 'react-hook-form';
import { LoginFormValues } from './types';

interface EmailFieldProps {
  control: Control<LoginFormValues>;
}

export const EmailField = ({ control }: EmailFieldProps) => {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 5 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>E-post</FormLabel>
            <FormControl>
              <div className="relative">
                <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="email" 
                  placeholder="din@epost.no" 
                  className="pl-8 transition-all"
                  {...field} 
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </motion.div>
  );
};
