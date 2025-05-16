
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
    redirectTo: returnUrl 
  });

  // Animation variants for form elements
  const formVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05
      }
    }
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
        <EmailField control={form.control} />
        <PasswordField control={form.control} />
        <SubmitButton 
          isSubmitting={isSubmitting} 
          currentAttempt={currentAttempt} 
          maxRetries={maxRetries} 
        />
        <RegisterLink userType={userType} />
        <DevInfo />
      </motion.form>
    </Form>
  );
};
