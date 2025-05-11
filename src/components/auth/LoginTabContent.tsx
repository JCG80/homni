
import { LoginForm } from '@/modules/auth/components/LoginForm';
import { Building, User } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <div className="flex items-center mb-4">
        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
          {userType === 'private' ? (
            <User className="h-5 w-5 text-primary" />
          ) : (
            <Building className="h-5 w-5 text-primary" />
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>
      
      <LoginForm redirectTo={redirectTo} userType={userType} />
    </motion.div>
  );
};
