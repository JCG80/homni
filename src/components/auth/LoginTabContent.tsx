
import { LoginForm } from '@/modules/auth/components/LoginForm';
import { motion } from 'framer-motion';
import { TabHeader } from './login/TabHeader';
import { useSearchParams } from 'react-router-dom';

interface LoginTabContentProps {
  title: string;
  subtitle: string;
  userType: 'private' | 'business';
  redirectTo?: string;
}

export const LoginTabContent: React.FC<LoginTabContentProps> = ({ 
  title, 
  subtitle, 
  userType, 
  redirectTo = '/dashboard' 
}) => {
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || redirectTo;
  
  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3 }}
      variants={fadeIn}
      className="space-y-6"
    >
      <TabHeader 
        title={title}
        subtitle={subtitle}
        userType={userType} 
      />
      
      <LoginForm redirectTo={returnUrl} userType={userType} />
    </motion.div>
  );
};
