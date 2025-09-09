
import { Form } from '@/components/ui/form';
import { motion, AnimatePresence } from 'framer-motion';
import { EmailField } from './login/EmailField';
import { PasswordField } from './login/PasswordField';
import { SubmitButton } from './login/SubmitButton';
import { RegisterLink } from './login/RegisterLink';
import { FormError } from './login/FormError';
import { DevInfo } from './login/DevInfo';
import { useLoginForm } from './login/useLoginForm';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { UserCircle, Building } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  userType?: 'private' | 'business';
}

export const LoginForm = ({ onSuccess, redirectTo, userType = 'private' }: LoginFormProps) => {
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || redirectTo;
  
  const {
    form,
    handleSubmit,
    isSubmitting,
    currentAttempt,
    maxRetries,
    error,
    lastError
  } = useLoginForm({ 
    onSuccess, 
    redirectTo: returnUrl,
    userType 
  });

  // Animation variants for form elements
  const formVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <Form {...form}>
      <motion.form 
        initial="hidden" 
        animate="visible" 
        variants={formVariants}
        onSubmit={handleSubmit} 
        className="space-y-5"
      >
        <motion.div 
          className="flex justify-center mb-6" 
          variants={itemVariants}
        >
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            {userType === 'business' ? (
              <Building className="h-8 w-8 text-primary" />
            ) : (
              <UserCircle className="h-8 w-8 text-primary" />
            )}
          </div>
        </motion.div>
        
        <AnimatePresence>
          {(error || lastError) && (
            <motion.div 
              variants={itemVariants}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <FormError error={error || (lastError ? lastError.message : null)} />
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div variants={itemVariants}>
          <EmailField control={form.control} />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <PasswordField control={form.control} />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <SubmitButton 
            isSubmitting={isSubmitting} 
            currentAttempt={currentAttempt} 
            maxRetries={maxRetries} 
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <RegisterLink userType={userType} />
        </motion.div>
        
        {import.meta.env.MODE === 'development' && (
          <motion.div variants={itemVariants}>
            <DevInfo />
          </motion.div>
        )}
      </motion.form>
    </Form>
  );
};
