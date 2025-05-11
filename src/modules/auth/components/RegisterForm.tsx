
import { BusinessRegistrationForm } from './forms/BusinessRegistrationForm';
import { PrivateRegistrationForm } from './forms/PrivateRegistrationForm';

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  userType?: 'private' | 'business';
}

export const RegisterForm = ({ 
  onSuccess, 
  redirectTo = '/', 
  userType = 'private' 
}: RegisterFormProps) => {
  return userType === 'business' ? (
    <BusinessRegistrationForm onSuccess={onSuccess} redirectTo={redirectTo} />
  ) : (
    <PrivateRegistrationForm onSuccess={onSuccess} redirectTo={redirectTo} />
  );
};
