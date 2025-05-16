
import { Form } from '@/components/ui/form';
import { motion } from 'framer-motion';
import { EmailField } from './login/EmailField';
import { PasswordField } from './login/PasswordField';
import { SubmitButton } from './login/SubmitButton';
import { RegisterLink } from './login/RegisterLink';
import { FormError } from './login/FormError';
import { DevInfo } from './login/DevInfo';
import { useLoginForm } from './login/useLoginForm';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  userType?: 'private' | 'business';
}

export const LoginForm = ({ onSuccess, redirectTo, userType = 'private' }: LoginFormProps) => {
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || redirectTo;
  
  // Enhanced logging for debugging
  useEffect(() => {
    console.log("LoginForm - Props:", { redirectTo, returnUrl, userType });
  }, [redirectTo, returnUrl, userType]);
  
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
        staggerChildren: 0.08
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
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
        <FormError error={error || (lastError ? lastError.message : null)} />
        
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
        
        <motion.div variants={itemVariants}>
          <DevInfo />
        </motion.div>
      </motion.form>
    </Form>
  );
};
