
import { LoginForm } from '@/modules/auth/components/LoginForm';
import { motion } from 'framer-motion';
import { TabHeader } from './login/TabHeader';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

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
  
  // Log the return URL for debugging
  useEffect(() => {
    console.log(`LoginTabContent (${userType}) - Return URL:`, returnUrl);
  }, [returnUrl, userType]);
  
  const staggerDelay = 0.05;
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <TabHeader 
          title={title}
          subtitle={subtitle}
          userType={userType} 
        />
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <LoginForm redirectTo={returnUrl} userType={userType} />
      </motion.div>
      
      {userType === 'business' && (
        <motion.div 
          variants={itemVariants}
          className="text-center text-sm mt-6 text-muted-foreground"
        >
          <p>Har du spørsmål om bedriftsinnlogging?</p>
          <p>Kontakt oss på <a href="mailto:support@homni.no" className="text-primary hover:underline">support@homni.no</a></p>
        </motion.div>
      )}
    </motion.div>
  );
};
