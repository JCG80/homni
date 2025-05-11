
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Control } from 'react-hook-form';
import { LoginFormValues } from './types';

interface PasswordFieldProps {
  control: Control<LoginFormValues>;
}

export const PasswordField = ({ control }: PasswordFieldProps) => {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 5 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      <FormField
        control={control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Passord</FormLabel>
            <FormControl>
              <div className="relative">
                <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="password"
                  placeholder="••••••••"
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
