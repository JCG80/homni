
import { LoginForm } from '@/modules/auth/components/LoginForm';
import { Building, User } from 'lucide-react';

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
      <div className="flex items-center mb-4">
        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
          {userType === 'private' ? (
            <User className="h-4 w-4 text-primary" />
          ) : (
            <Building className="h-4 w-4 text-primary" />
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
    </>
  );
};
