
import { LoginForm } from '@/modules/auth/components/LoginForm';

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
  return (
    <>
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-muted-foreground mt-2">
        {subtitle}
      </p>
      
      <LoginForm redirectTo={redirectTo} userType={userType} />
    </>
  );
};
